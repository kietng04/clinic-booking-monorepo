package com.clinicbooking.paymentservice.service.impl;

import com.clinicbooking.paymentservice.client.AppointmentPaymentSyncClient;
import com.clinicbooking.paymentservice.dto.request.ConfirmCounterPaymentRequest;
import com.clinicbooking.paymentservice.dto.request.CreatePaymentRequest;
import com.clinicbooking.paymentservice.dto.request.RefundPaymentRequest;
import com.clinicbooking.paymentservice.dto.request.UpdatePaymentRequest;
import com.clinicbooking.paymentservice.dto.response.MomoCallbackResponse;
import com.clinicbooking.paymentservice.dto.response.MomoQueryResponse;
import com.clinicbooking.paymentservice.dto.response.MomoRefundResponse;
import com.clinicbooking.paymentservice.dto.response.PaymentResponse;
import com.clinicbooking.paymentservice.dto.event.PaymentEvent;
import com.clinicbooking.paymentservice.entity.PaymentOrder;
import com.clinicbooking.paymentservice.entity.PaymentTransaction;
import com.clinicbooking.paymentservice.entity.RefundTransaction;
import com.clinicbooking.paymentservice.enums.PaymentStatus;
import com.clinicbooking.paymentservice.enums.RefundStatus;
import com.clinicbooking.paymentservice.enums.PaymentMethod;
import com.clinicbooking.paymentservice.exception.*;
import com.clinicbooking.paymentservice.repository.PaymentOrderRepository;
import com.clinicbooking.paymentservice.repository.PaymentTransactionRepository;
import com.clinicbooking.paymentservice.repository.RefundTransactionRepository;
import com.clinicbooking.paymentservice.service.IPaymentService;
import com.clinicbooking.paymentservice.service.IPaymentEventPublisher;
import com.clinicbooking.paymentservice.service.IMomoPaymentService;
import com.clinicbooking.paymentservice.util.OrderIdGenerator;
import com.clinicbooking.paymentservice.util.ReceiptPdfGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {

    private final PaymentOrderRepository paymentOrderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final RefundTransactionRepository refundTransactionRepository;

    private final IMomoPaymentService momoPaymentService;
    private final IPaymentEventPublisher eventPublisher;
    private final AppointmentPaymentSyncClient appointmentPaymentSyncClient;

    @Value("${payment.redirect-url}")
    private String redirectUrl;

    @Value("${payment.ipn-url}")
    private String ipnUrl;

    private static final String CACHE_NAME = "paymentOrders";

    
    @Override
    @Transactional
    @CacheEvict(value = CACHE_NAME, key = "#result.orderId")
    public PaymentResponse createPayment(CreatePaymentRequest request, Long patientId) {
        log.info("Creating payment for appointment {} by patient {}", request.getAppointmentId(), patientId);

        if (paymentOrderRepository.existsByAppointmentId(request.getAppointmentId())) {
            log.warn("Duplicate payment creation attempt for appointment {}", request.getAppointmentId());
            throw new DuplicatePaymentException(
                String.format("Payment already exists for appointment %d", request.getAppointmentId()),
                "APPOINTMENT_ALREADY_HAS_PAYMENT"
            );
        }

        validatePaymentAmount(request.getAmount());

        if (request.getPatientName() == null || request.getPatientName().trim().isEmpty() ||
            request.getPatientEmail() == null || request.getPatientEmail().trim().isEmpty()) {
            log.error("Missing required patient information for appointment {}", request.getAppointmentId());
            throw new PaymentException(
                "Patient details (name, email) are required",
                HttpStatus.BAD_REQUEST,
                "MISSING_PATIENT_INFO"
            );
        }

        try {

            String orderId = OrderIdGenerator.generateOrderId();
            log.debug("Generated order ID: {}", orderId);

            PaymentMethod paymentMethod = PaymentMethod.MOMO_WALLET;
            if (request.getPaymentMethod() != null && !request.getPaymentMethod().isEmpty()) {
                try {
                    paymentMethod = PaymentMethod.valueOf(request.getPaymentMethod());
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid payment method: {}, using default", request.getPaymentMethod());
                }
            }

            PaymentOrder paymentOrder = PaymentOrder.builder()
                    .orderId(orderId)
                    .appointmentId(request.getAppointmentId())
                    .patientId(patientId)
                    .amount(request.getAmount())
                    .currency("VND")
                    .description(request.getDescription())
                    .paymentMethod(paymentMethod)
                    .status(PaymentStatus.PENDING)
                    .patientName(request.getPatientName())
                    .patientEmail(request.getPatientEmail())
                    .patientPhone(request.getPatientPhone())
                    .doctorId(request.getDoctorId())
                    .doctorName(request.getDoctorName())
                    .build();

            // For counter payments (CASH, BANK_TRANSFER, CARD_AT_COUNTER), skip Momo API
            if (paymentMethod.requiresReceptionistConfirmation()) {
                log.info("Creating counter payment order {} with method {}", orderId, paymentMethod);

                paymentOrder = paymentOrderRepository.save(paymentOrder);
                log.info("Created counter payment order {} for appointment {}", orderId, request.getAppointmentId());

                try {
                    publishPaymentCreated(paymentOrder);
                } catch (Exception e) {
                    log.error("Failed to publish payment.created event for order: {}", orderId, e);
                }

                appointmentPaymentSyncClient.linkPaymentOrder(
                        paymentOrder.getAppointmentId(),
                        orderId,
                        paymentMethod.name(),
                        null
                );
                syncAppointmentPaymentState(paymentOrder, null);

                return PaymentResponse.builder()
                        .orderId(orderId)
                        .invoiceNumber(orderId)
                        .appointmentId(request.getAppointmentId())
                        .patientId(patientId)
                        .description(request.getDescription())
                        .amount(request.getAmount())
                        .finalAmount(request.getAmount())
                        .status(PaymentStatus.PENDING.toString())
                        .currency("VND")
                        .paymentMethod(paymentMethod.name())
                        .createdAt(paymentOrder.getCreatedAt())
                        .expiresAt(null)  // No expiration for counter payments
                        .build();
            }

            // For online payments (Momo), call Momo API
            log.debug("Calling Momo API to create payment request for order {}", orderId);
            PaymentResponse momoResponse = momoPaymentService.createPaymentRequest(request, orderId);
            paymentOrder.setExpiredAt(momoResponse.getExpiresAt());

            PaymentTransaction transaction = PaymentTransaction.builder()
                    .paymentOrder(paymentOrder)
                    .partnerCode(momoResponse.getTransactionId() != null ? "PARTNER" : "PARTNER")
                    .requestId(orderId)
                    .requestType(paymentMethod.getMomoRequestType())
                    .amount(request.getAmount().longValue() * 1000)
                    .orderInfo("Payment for appointment " + request.getAppointmentId())
                    .payUrl(momoResponse.getPayUrl())
                    .deeplink(momoResponse.getDeeplink())
                    .qrCodeUrl(momoResponse.getQrCodeUrl())
                    .redirectUrl(redirectUrl)
                    .ipnUrl(ipnUrl)
                    .build();

            paymentOrder = paymentOrderRepository.save(paymentOrder);
            transaction = paymentTransactionRepository.save(transaction);
            log.info("Created payment order {} for appointment {}", orderId, request.getAppointmentId());

            try {
                publishPaymentCreated(paymentOrder);
            } catch (Exception e) {
                log.error("Failed to publish payment.created event for order: {}", orderId, e);

            }

            appointmentPaymentSyncClient.linkPaymentOrder(
                    paymentOrder.getAppointmentId(),
                    orderId,
                    paymentMethod.name(),
                    momoResponse.getExpiresAt()
            );
            syncAppointmentPaymentState(paymentOrder, momoResponse.getExpiresAt());

            return PaymentResponse.builder()
                    .orderId(orderId)
                    .invoiceNumber(orderId)
                    .appointmentId(request.getAppointmentId())
                    .patientId(patientId)
                    .payUrl(momoResponse.getPayUrl())
                    .deeplink(momoResponse.getDeeplink())
                    .qrCodeUrl(momoResponse.getQrCodeUrl())
                    .amount(request.getAmount())
                    .finalAmount(request.getAmount())
                    .description(request.getDescription())
                    .status(PaymentStatus.PENDING.toString())
                    .currency("VND")
                    .paymentMethod(paymentMethod.name())
                    .createdAt(paymentOrder.getCreatedAt())
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .build();

        } catch (PaymentException e) {
            log.error("Error creating payment: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating payment for appointment {}", request.getAppointmentId(), e);
            throw new PaymentException(
                "Failed to create payment: " + e.getMessage(),
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                "PAYMENT_CREATION_FAILED",
                e
            );
        }
    }

    
    @Override
    @Transactional
    @CacheEvict(value = CACHE_NAME, key = "#callback.orderId")
    public void handleMomoCallback(MomoCallbackResponse callback) {
        log.info("Processing Momo callback for order {}", callback.getOrderId());

        if (callback == null || callback.getOrderId() == null) {
            log.error("Invalid callback: missing orderId");
            throw new InvalidSignatureException("Invalid callback: missing required fields");
        }

        try {

            log.debug("Verifying Momo callback signature");
            if (!momoPaymentService.verifyCallback(callback)) {
                log.error("Callback signature verification failed for order {}", callback.getOrderId());
                throw new InvalidSignatureException("Invalid callback signature");
            }

            PaymentOrder paymentOrder = paymentOrderRepository.findByOrderIdWithLock(callback.getOrderId())
                    .orElseThrow(() -> new PaymentNotFoundException(callback.getOrderId()));

            if (paymentOrder.getStatus() == PaymentStatus.COMPLETED ||
                    paymentOrder.getStatus() == PaymentStatus.FAILED ||
                    paymentOrder.getStatus() == PaymentStatus.REFUNDED) {
                log.warn("Callback for order {} already processed with status {}",
                        callback.getOrderId(), paymentOrder.getStatus());
                return;
            }

            PaymentTransaction transaction = paymentTransactionRepository
                    .findByPaymentOrderId(paymentOrder.getId())
                    .orElse(null);

            if (transaction == null) {
                log.warn("No payment transaction found for order {}", callback.getOrderId());
                transaction = PaymentTransaction.builder()
                        .paymentOrder(paymentOrder)
                        .requestId(callback.getRequestId())
                        .partnerCode(callback.getPartnerCode())
                        .requestType("captureWallet")
                        .amount(callback.getAmount() != null ? callback.getAmount() : 0L)
                        .build();
            }

            transaction.setTransId(callback.getTransactionId());
            transaction.setResultCode(callback.getResultCode());
            transaction.setMessage(callback.getMessage());
            paymentTransactionRepository.save(transaction);

            if (callback.isSuccessful()) {
                paymentOrder.setStatus(PaymentStatus.COMPLETED);
                paymentOrder.setCompletedAt(LocalDateTime.now());
                log.info("Payment completed for order {} with transaction ID {}",
                        callback.getOrderId(), callback.getTransactionId());

                try {
                    publishPaymentCompleted(paymentOrder, callback.getTransactionId());
                } catch (Exception e) {
                    log.error("Failed to publish payment.completed event for order: {}", callback.getOrderId(), e);

                }
            } else {
                paymentOrder.setStatus(PaymentStatus.FAILED);
                log.warn("Payment failed for order {}: {}", callback.getOrderId(), callback.getMessage());

                try {
                    publishPaymentFailed(paymentOrder, callback.getMessage());
                } catch (Exception e) {
                    log.error("Failed to publish payment.failed event for order: {}", callback.getOrderId(), e);

                }
            }

            paymentOrderRepository.save(paymentOrder);
            syncAppointmentPaymentState(paymentOrder, paymentOrder.getExpiredAt());
            log.info("Callback processing completed for order {}", callback.getOrderId());

        } catch (PaymentException e) {
            log.error("Callback processing failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error processing callback for order {}", callback.getOrderId(), e);
            throw new PaymentException(
                "Failed to process callback: " + e.getMessage(),
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                "CALLBACK_PROCESSING_FAILED",
                e
            );
        }
    }

    
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "#orderId")
    public PaymentResponse getPaymentByOrderId(String orderId) {
        log.debug("Fetching payment by order ID: {}", orderId);

        PaymentOrder paymentOrder = paymentOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException(orderId));

        return mapToPaymentResponse(paymentOrder);
    }


    @Override
    @Transactional
    @CacheEvict(value = CACHE_NAME, key = "#orderId")
    public PaymentResponse updatePayment(String orderId, UpdatePaymentRequest request) {
        log.info("Updating payment for order ID: {}", orderId);

        PaymentOrder paymentOrder = paymentOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException(orderId));

        // Only allow updating non-financial fields
        // Cannot update completed, refunded, or failed payments
        if (paymentOrder.isCompleted() || paymentOrder.isRefunded() || paymentOrder.isFailed()) {
            log.warn("Cannot update payment {} with status {}", orderId, paymentOrder.getStatus());
            throw new PaymentException(
                "Cannot update payment with status " + paymentOrder.getStatus(),
                HttpStatus.BAD_REQUEST,
                "INVALID_PAYMENT_STATUS_FOR_UPDATE"
            );
        }

        // Update description only
        if (request.getDescription() != null) {
            paymentOrder.setDescription(request.getDescription());
        }

        paymentOrder = paymentOrderRepository.save(paymentOrder);
        log.info("Payment updated successfully: {}", orderId);

        return mapToPaymentResponse(paymentOrder);
    }


    @Override
    @Transactional
    @CacheEvict(value = CACHE_NAME, key = "#orderId")
    public void cancelPayment(String orderId) {
        log.info("Cancelling payment for order ID: {}", orderId);

        PaymentOrder paymentOrder = paymentOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException(orderId));

        // Can only cancel pending payments
        if (!paymentOrder.isPending()) {
            log.warn("Cannot cancel payment {} with status {}", orderId, paymentOrder.getStatus());
            throw new PaymentException(
                "Can only cancel pending payments. Current status: " + paymentOrder.getStatus(),
                HttpStatus.BAD_REQUEST,
                "INVALID_PAYMENT_STATUS_FOR_CANCEL"
            );
        }

        // Set status to expired (soft delete)
        paymentOrder.setStatus(PaymentStatus.EXPIRED);
        paymentOrder.setExpiredAt(LocalDateTime.now());
        paymentOrderRepository.save(paymentOrder);
        syncAppointmentPaymentState(paymentOrder, paymentOrder.getExpiredAt());

        // Publish cancellation event (using paymentFailed publisher)
        PaymentEvent cancelledEvent = PaymentEvent.builder()
                .eventType("payment.cancelled")
                .data(PaymentEvent.PaymentEventData.builder()
                    .orderId(paymentOrder.getOrderId())
                    .appointmentId(paymentOrder.getAppointmentId())
                    .patientId(paymentOrder.getPatientId())
                    .doctorId(paymentOrder.getDoctorId())
                    .amount(paymentOrder.getAmount())
                    .status(PaymentStatus.EXPIRED.name())
                    .errorMessage("Payment cancelled by user")
                    .build())
                .build();
        eventPublisher.publishPaymentFailed(cancelledEvent);

        log.info("Payment cancelled successfully: {}", orderId);
    }


    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByAppointmentId(Long appointmentId) {
        log.debug("Fetching payment by appointment ID: {}", appointmentId);

        PaymentOrder paymentOrder = paymentOrderRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new PaymentNotFoundException(
                        String.format("Payment not found for appointment %d", appointmentId)
                ));

        return mapToPaymentResponse(paymentOrder);
    }

    
    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getPatientPayments(Long patientId, Pageable pageable) {
        log.debug("Fetching payments for patient {}", patientId);

        Page<PaymentOrder> paymentOrders = paymentOrderRepository.findByPatientId(patientId, pageable);
        return paymentOrders.map(this::mapToPaymentResponse);
    }

    
    @Override
    @Transactional
    @CacheEvict(value = CACHE_NAME, key = "#request.orderId")
    public RefundResponse refundPayment(RefundPaymentRequest request) {
        log.info("Processing refund for order {}", request.getOrderId());

        try {

            PaymentOrder paymentOrder = paymentOrderRepository.findByOrderId(request.getOrderId())
                    .orElseThrow(() -> new PaymentNotFoundException(request.getOrderId()));

            if (paymentOrder.getStatus() != PaymentStatus.COMPLETED &&
                paymentOrder.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
                log.warn("Cannot refund payment {} with status {}", request.getOrderId(), paymentOrder.getStatus());
                throw new PaymentException(
                    String.format("Cannot refund payment with status %s", paymentOrder.getStatus()),
                    HttpStatus.BAD_REQUEST,
                    "INVALID_PAYMENT_STATUS"
                );
            }

            BigDecimal totalRefunded = refundTransactionRepository
                .findByPaymentOrderIdAndStatus(paymentOrder.getId(), RefundStatus.COMPLETED)
                .stream()
                .map(RefundTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal remainingAmount = paymentOrder.getAmount().subtract(totalRefunded);

            if (request.getAmount().compareTo(remainingAmount) > 0) {
                log.error("Refund amount {} exceeds remaining refundable amount {} for order {}",
                          request.getAmount(), remainingAmount, request.getOrderId());
                throw new PaymentException(
                    String.format("Refund amount %.2f exceeds remaining refundable amount %.2f",
                                  request.getAmount(), remainingAmount),
                    HttpStatus.BAD_REQUEST,
                    "INSUFFICIENT_REFUNDABLE_AMOUNT"
                );
            }

            PaymentTransaction transaction = paymentTransactionRepository
                    .findByPaymentOrderId(paymentOrder.getId())
                    .orElseThrow(() -> new PaymentNotFoundException(request.getOrderId()));

            if (transaction.getTransId() == null) {
                log.error("Cannot refund: Momo transaction ID not available for order {}", request.getOrderId());
                throw new PaymentException(
                    "Cannot refund: Transaction ID not available",
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "MISSING_TRANSACTION_ID"
                );
            }

            log.debug("Calling Momo refund API for transaction {}", transaction.getTransId());
            MomoRefundResponse momoRefundResponse = momoPaymentService.refundPayment(
                    request.getOrderId(),
                    transaction.getTransId(),
                    request.getAmount(),
                    request.getReason()
            );

            String refundId = "REFUND" + System.currentTimeMillis();
            RefundTransaction refundTransaction = RefundTransaction.builder()
                    .paymentOrder(paymentOrder)
                    .paymentTransaction(transaction)
                    .refundId(refundId)
                    .transId(transaction.getTransId())
                    .amount(request.getAmount())
                    .reason(request.getReason())
                    .status(RefundStatus.PENDING)
                    .build();

            if (momoRefundResponse.isSuccess()) {
                refundTransaction.setStatus(RefundStatus.COMPLETED);
                refundTransaction.setCompletedAt(LocalDateTime.now());
                refundTransaction.setResultCode(0);
                refundTransaction.setMessage("Refund successful");

                BigDecimal newTotalRefunded = totalRefunded.add(request.getAmount());
                boolean isFullRefund = newTotalRefunded.compareTo(paymentOrder.getAmount()) == 0;

                if (isFullRefund) {
                    paymentOrder.setStatus(PaymentStatus.REFUNDED);
                } else {
                    paymentOrder.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
                }
                paymentOrderRepository.save(paymentOrder);
                syncAppointmentPaymentState(paymentOrder, paymentOrder.getExpiredAt());

                try {
                    publishPaymentRefunded(paymentOrder, request.getAmount(), request.getReason(), !isFullRefund);
                } catch (Exception e) {
                    log.error("Failed to publish payment.refunded event for order: {}", request.getOrderId(), e);

                }

                log.info("Refund {} created successfully for order {}", refundId, request.getOrderId());

            } else {
                refundTransaction.setStatus(RefundStatus.FAILED);
                refundTransaction.setResultCode(momoRefundResponse.getResultCode());
                refundTransaction.setMessage(momoRefundResponse.getMessage());

                refundTransactionRepository.save(refundTransaction);

                log.error("Refund {} failed for order {}: {}", refundId, request.getOrderId(),
                          momoRefundResponse.getMessage());

                throw new PaymentException(
                    "Refund failed: " + momoRefundResponse.getMessage(),
                    HttpStatus.BAD_REQUEST,
                    "MOMO_REFUND_FAILED"
                );
            }

            refundTransactionRepository.save(refundTransaction);

            return new RefundResponse(refundId, refundTransaction.getStatus().toString(), request.getAmount());

        } catch (PaymentException e) {
            log.error("Refund processing failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error processing refund for order {}", request.getOrderId(), e);
            throw new PaymentException(
                "Failed to process refund: " + e.getMessage(),
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                "REFUND_PROCESSING_FAILED",
                e
            );
        }
    }


    @Override
    @Transactional
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    public PaymentResponse queryPaymentStatus(String orderId) {
        log.info("Querying payment status for order {}", orderId);

        try {
            PaymentOrder paymentOrder = paymentOrderRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new PaymentNotFoundException(orderId));

            PaymentTransaction transaction = paymentTransactionRepository
                    .findByPaymentOrderId(paymentOrder.getId())
                    .orElseThrow(() -> new PaymentNotFoundException(orderId));

            MomoQueryResponse queryResponse = momoPaymentService.queryTransactionStatus(orderId, transaction.getRequestId());

            if (queryResponse.getResultCode() != null) {
                transaction.setResultCode(queryResponse.getResultCode());
                transaction.setMessage(queryResponse.getMessage());

                if (queryResponse.getResultCode() == 0 && paymentOrder.getStatus() != PaymentStatus.COMPLETED) {
                    paymentOrder.setStatus(PaymentStatus.COMPLETED);
                    paymentOrder.setCompletedAt(LocalDateTime.now());
                    log.info("Updated payment status to COMPLETED for order {}", orderId);

                    paymentTransactionRepository.save(transaction);
                    paymentOrderRepository.save(paymentOrder);
                    syncAppointmentPaymentState(paymentOrder, paymentOrder.getExpiredAt());

                    try {
                        publishPaymentCompleted(paymentOrder, transaction.getTransId());
                    } catch (Exception e) {
                        log.error("Failed to publish payment.completed event during status query for order: {}", orderId, e);

                    }
                } else {
                    paymentTransactionRepository.save(transaction);
                    paymentOrderRepository.save(paymentOrder);
                    syncAppointmentPaymentState(paymentOrder, paymentOrder.getExpiredAt());
                }
            }

            return mapToPaymentResponse(paymentOrder);

        } catch (PaymentNotFoundException e) {
            log.error("Payment not found for query: {}", orderId);
            throw e;
        } catch (Exception e) {
            log.error("Error querying payment status for order {}", orderId, e);
            throw new PaymentException(
                "Failed to query payment status: " + e.getMessage(),
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                "STATUS_QUERY_FAILED",
                e
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportPatientPaymentsCsv(Long patientId, LocalDateTime fromDate, LocalDateTime toDate) {
        List<PaymentOrder> orders;
        if (fromDate != null && toDate != null) {
            orders = paymentOrderRepository
                    .findByPatientIdAndCreatedAtBetween(patientId, fromDate, toDate, Pageable.unpaged())
                    .getContent();
        } else {
            orders = paymentOrderRepository
                    .findByPatientId(patientId, Pageable.unpaged())
                    .getContent();
        }

        StringBuilder csv = new StringBuilder();
        csv.append("orderId,appointmentId,amount,finalAmount,currency,status,paymentMethod,createdAt,description\n");
        for (PaymentOrder order : orders) {
            csv.append(escapeCsv(order.getOrderId())).append(',')
                    .append(order.getAppointmentId()).append(',')
                    .append(order.getAmount()).append(',')
                    .append(order.getAmount()).append(',')
                    .append(escapeCsv(order.getCurrency())).append(',')
                    .append(escapeCsv(order.getStatus().toString())).append(',')
                    .append(escapeCsv(order.getPaymentMethod().name())).append(',')
                    .append(escapeCsv(order.getCreatedAt() != null ? order.getCreatedAt().toString() : ""))
                    .append(',')
                    .append(escapeCsv(order.getDescription()))
                    .append('\n');
        }

        return csv.toString().getBytes();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateReceiptPdf(String orderId) {
        PaymentOrder paymentOrder = paymentOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException(orderId));

        PaymentResponse paymentResponse = mapToPaymentResponse(paymentOrder);
        return ReceiptPdfGenerator.generate(paymentOrder, paymentResponse);
    }

    /**
     * Confirm counter payment by receptionist
     * Used when patient pays cash/bank transfer/card at clinic counter
     */
    @Override
    @Transactional
    @CacheEvict(value = CACHE_NAME, key = "#orderId")
    public PaymentResponse confirmCounterPayment(String orderId, ConfirmCounterPaymentRequest request) {
        log.info("Confirming counter payment for order {} by receptionist {}", orderId, request.getReceptionistName());

        try {
            // Find payment order
            PaymentOrder paymentOrder = paymentOrderRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new PaymentNotFoundException(orderId));

            // Validate payment status
            if (!paymentOrder.isPending()) {
                log.warn("Cannot confirm counter payment for order {} with status {}", orderId, paymentOrder.getStatus());
                throw new PaymentException(
                    "Can only confirm pending payments. Current status: " + paymentOrder.getStatus(),
                    HttpStatus.BAD_REQUEST,
                    "INVALID_PAYMENT_STATUS"
                );
            }

            // Validate payment method is a counter payment method
            if (!request.getPaymentMethod().requiresReceptionistConfirmation()) {
                log.error("Invalid payment method {} for counter payment confirmation", request.getPaymentMethod());
                throw new PaymentException(
                    "Invalid payment method for counter payment: " + request.getPaymentMethod(),
                    HttpStatus.BAD_REQUEST,
                    "INVALID_PAYMENT_METHOD"
                );
            }

            // Update payment order
            paymentOrder.setPaymentMethod(request.getPaymentMethod());
            paymentOrder.setStatus(PaymentStatus.COMPLETED);
            paymentOrder.setCompletedAt(LocalDateTime.now());
            paymentOrder.setConfirmedByUserId(request.getConfirmedByUserId());
            paymentOrder.setConfirmedAt(LocalDateTime.now());
            paymentOrder.setConfirmationNote(request.getNote());

            paymentOrder = paymentOrderRepository.save(paymentOrder);
            syncAppointmentPaymentState(paymentOrder, paymentOrder.getExpiredAt());
            log.info("Counter payment confirmed successfully for order {} using {}", orderId, request.getPaymentMethod());

            // Publish payment completed event
            try {
                publishPaymentCompleted(paymentOrder, null);
            } catch (Exception e) {
                log.error("Failed to publish payment.completed event for counter payment: {}", orderId, e);
            }

            return mapToPaymentResponse(paymentOrder);

        } catch (PaymentException e) {
            log.error("Counter payment confirmation failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error confirming counter payment for order {}", orderId, e);
            throw new PaymentException(
                "Failed to confirm counter payment: " + e.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR,
                "COUNTER_PAYMENT_CONFIRMATION_FAILED",
                e
            );
        }
    }

    /**
     * Get all pending counter payments
     * Used by receptionist dashboard to see payments waiting for confirmation
     */
    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getPendingCounterPayments(Pageable pageable) {
        log.debug("Fetching pending counter payments");

        // Find all pending payment orders with counter payment methods only
        List<PaymentMethod> counterPaymentMethods = List.of(
                PaymentMethod.CASH,
                PaymentMethod.BANK_TRANSFER,
                PaymentMethod.CARD_AT_COUNTER
        );

        Page<PaymentOrder> paymentOrders = paymentOrderRepository
                .findByStatusAndPaymentMethodInOrderByCreatedAtAsc(
                        PaymentStatus.PENDING,
                        counterPaymentMethods,
                        pageable
                );

        return paymentOrders.map(this::mapToPaymentResponse);
    }


    private void validatePaymentAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.valueOf(1000)) < 0) {
            throw new PaymentException(
                "Payment amount must be at least 1,000 VND",
                org.springframework.http.HttpStatus.BAD_REQUEST,
                "INVALID_AMOUNT"
            );
        }
        if (amount.compareTo(BigDecimal.valueOf(999999.99)) > 0) {
            throw new PaymentException(
                "Payment amount cannot exceed 999,999.99 VND",
                org.springframework.http.HttpStatus.BAD_REQUEST,
                "INVALID_AMOUNT"
            );
        }
    }

    private void syncAppointmentPaymentState(PaymentOrder paymentOrder, LocalDateTime paymentExpiresAt) {
        appointmentPaymentSyncClient.updatePaymentStatus(
                paymentOrder.getAppointmentId(),
                mapAppointmentPaymentStatus(paymentOrder.getStatus()),
                paymentOrder.getPaymentMethod() != null ? paymentOrder.getPaymentMethod().name() : null,
                paymentExpiresAt,
                paymentOrder.getCompletedAt()
        );
    }

    private String mapAppointmentPaymentStatus(PaymentStatus status) {
        if (status == null) {
            return null;
        }

        return switch (status) {
            case PENDING, PROCESSING -> "PENDING_PAYMENT";
            case COMPLETED -> "PAID";
            case FAILED -> "PAYMENT_FAILED";
            case EXPIRED -> "PAYMENT_EXPIRED";
            case REFUNDED -> "REFUNDED";
            case PARTIALLY_REFUNDED -> "PARTIALLY_REFUNDED";
        };
    }


    private PaymentResponse mapToPaymentResponse(PaymentOrder paymentOrder) {
        PaymentTransaction transaction = paymentTransactionRepository
                .findByPaymentOrderId(paymentOrder.getId())
                .orElse(null);

        return PaymentResponse.builder()
                .orderId(paymentOrder.getOrderId())
                .patientId(paymentOrder.getPatientId())
                .invoiceNumber(paymentOrder.getOrderId())
                .appointmentId(paymentOrder.getAppointmentId())
                .payUrl(transaction != null ? transaction.getPayUrl() : null)
                .deeplink(transaction != null ? transaction.getDeeplink() : null)
                .qrCodeUrl(transaction != null ? transaction.getQrCodeUrl() : null)
                .amount(paymentOrder.getAmount())
                .finalAmount(paymentOrder.getAmount())
                .description(paymentOrder.getDescription())
                .status(paymentOrder.getStatus().toString())
                .currency(paymentOrder.getCurrency())
                .paymentMethod(paymentOrder.getPaymentMethod().name())
                .createdAt(paymentOrder.getCreatedAt())
                .expiresAt(paymentOrder.getExpiredAt())
                .transactionId(transaction != null ? transaction.getTransId() != null ? transaction.getTransId().toString() : null : null)
                .confirmedByUserId(paymentOrder.getConfirmedByUserId())
                .confirmedAt(paymentOrder.getConfirmedAt())
                .confirmationNote(paymentOrder.getConfirmationNote())
                .build();
    }

    
    private void publishPaymentCreated(PaymentOrder paymentOrder) {
        PaymentEvent event = PaymentEvent.paymentCreated(
                paymentOrder.getOrderId(),
                paymentOrder.getAppointmentId(),
                paymentOrder.getPatientId(),
                paymentOrder.getDoctorId(),
                paymentOrder.getAmount(),
                paymentOrder.getPaymentMethod().toString(),
                paymentOrder.getDescription()
        );
        eventPublisher.publishPaymentCreated(event);
        log.debug("Published payment.created event for order {}", paymentOrder.getOrderId());
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        boolean shouldQuote = value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r");
        if (!shouldQuote) {
            return value;
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    
    private void publishPaymentCompleted(PaymentOrder paymentOrder, Long transactionId) {
        PaymentEvent event = PaymentEvent.paymentCompleted(
                paymentOrder.getOrderId(),
                paymentOrder.getAppointmentId(),
                paymentOrder.getPatientId(),
                paymentOrder.getDoctorId(),
                paymentOrder.getAmount(),
                transactionId != null ? transactionId.toString() : null
        );
        eventPublisher.publishPaymentCompleted(event);
        log.debug("Published payment.completed event for order {}", paymentOrder.getOrderId());
    }

    
    private void publishPaymentFailed(PaymentOrder paymentOrder, String errorMessage) {
        PaymentEvent event = PaymentEvent.paymentFailed(
                paymentOrder.getOrderId(),
                paymentOrder.getAppointmentId(),
                paymentOrder.getPatientId(),
                paymentOrder.getDoctorId(),
                errorMessage,
                "PAYMENT_FAILED"
        );
        eventPublisher.publishPaymentFailed(event);
        log.debug("Published payment.failed event for order {}", paymentOrder.getOrderId());
    }

    
    private void publishPaymentRefunded(PaymentOrder paymentOrder, BigDecimal refundAmount,
                                       String reason, boolean isPartial) {
        PaymentEvent event = PaymentEvent.paymentRefunded(
                paymentOrder.getOrderId(),
                paymentOrder.getAppointmentId(),
                paymentOrder.getPatientId(),
                paymentOrder.getDoctorId(),
                refundAmount,
                reason,
                isPartial
        );
        eventPublisher.publishPaymentRefunded(event);
        log.debug("Published payment.{} event for order {}",
                isPartial ? "partially_refunded" : "refunded", paymentOrder.getOrderId());
    }
}
