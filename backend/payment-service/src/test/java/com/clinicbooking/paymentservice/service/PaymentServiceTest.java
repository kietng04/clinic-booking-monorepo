package com.clinicbooking.paymentservice.service;

import com.clinicbooking.paymentservice.client.AppointmentPaymentSyncClient;
import com.clinicbooking.paymentservice.dto.request.ConfirmCounterPaymentRequest;
import com.clinicbooking.paymentservice.dto.request.CreatePaymentRequest;
import com.clinicbooking.paymentservice.dto.request.RefundPaymentRequest;
import com.clinicbooking.paymentservice.dto.response.MomoCallbackResponse;
import com.clinicbooking.paymentservice.dto.response.MomoQueryResponse;
import com.clinicbooking.paymentservice.dto.response.MomoRefundResponse;
import com.clinicbooking.paymentservice.dto.response.PaymentResponse;
import com.clinicbooking.paymentservice.entity.PaymentOrder;
import com.clinicbooking.paymentservice.entity.PaymentTransaction;
import com.clinicbooking.paymentservice.entity.RefundTransaction;
import com.clinicbooking.paymentservice.enums.PaymentMethod;
import com.clinicbooking.paymentservice.enums.PaymentStatus;
import com.clinicbooking.paymentservice.enums.RefundStatus;
import com.clinicbooking.paymentservice.exception.DuplicatePaymentException;
import com.clinicbooking.paymentservice.exception.InvalidSignatureException;
import com.clinicbooking.paymentservice.exception.PaymentException;
import com.clinicbooking.paymentservice.exception.PaymentNotFoundException;
import com.clinicbooking.paymentservice.repository.PaymentOrderRepository;
import com.clinicbooking.paymentservice.repository.PaymentTransactionRepository;
import com.clinicbooking.paymentservice.repository.RefundTransactionRepository;
import com.clinicbooking.paymentservice.service.impl.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService Tests - CRITICAL: Money Handling")
class PaymentServiceTest {

    @Mock
    private PaymentOrderRepository paymentOrderRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private RefundTransactionRepository refundTransactionRepository;

    @Mock
    private IMomoPaymentService momoPaymentService;

    @Mock
    private IPaymentEventPublisher eventPublisher;

    @Mock
    private AppointmentPaymentSyncClient appointmentPaymentSyncClient;

    @InjectMocks
    private PaymentService paymentService;

    private CreatePaymentRequest createPaymentRequest;
    private PaymentOrder paymentOrder;
    private PaymentTransaction paymentTransaction;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "redirectUrl", "http://localhost/callback");
        ReflectionTestUtils.setField(paymentService, "ipnUrl", "http://localhost/ipn");

        createPaymentRequest = CreatePaymentRequest.builder()
                .appointmentId(1L)
                .amount(new BigDecimal("50000.00"))
                .description("Appointment payment")
                .paymentMethod("MOMO_WALLET")
                .patientName("John Doe")
                .patientEmail("john@example.com")
                .patientPhone("0123456789")
                .doctorId(200L)
                .doctorName("Dr. Smith")
                .build();

        paymentOrder = PaymentOrder.builder()
                .id(1L)
                .orderId("ORDER123456789")
                .appointmentId(1L)
                .patientId(100L)
                .doctorId(200L)
                .patientName("John Doe")
                .patientEmail("john@example.com")
                .patientPhone("0123456789")
                .doctorName("Dr. Smith")
                .amount(new BigDecimal("50000.00"))
                .currency("VND")
                .description("Appointment payment")
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .status(PaymentStatus.PENDING)
                .build();

        paymentTransaction = PaymentTransaction.builder()
                .id(1L)
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("ORDER123456789")
                .transId(999888777L)
                .amount(50000000L)
                .resultCode(0)
                .payUrl("http://momo.vn/pay")
                .build();
    }

    @Test
    @DisplayName("Should create payment successfully for online payment")
    void testCreatePayment_Success() throws Exception {
        when(paymentOrderRepository.existsByAppointmentId(1L)).thenReturn(false);

        PaymentResponse momoResponse = PaymentResponse.builder()
                .orderId("ORDER123456789")
                .payUrl("http://momo.vn/pay")
                .deeplink("momo://pay")
                .qrCodeUrl("http://momo.vn/qr")
                .build();

        when(momoPaymentService.createPaymentRequest(any(), anyString())).thenReturn(momoResponse);
        when(paymentOrderRepository.save(any(PaymentOrder.class))).thenReturn(paymentOrder);
        when(paymentTransactionRepository.save(any(PaymentTransaction.class))).thenReturn(paymentTransaction);

        PaymentResponse result = paymentService.createPayment(createPaymentRequest, 100L);

        assertThat(result).isNotNull();
        assertThat(result.getOrderId()).isNotBlank();
        assertThat(result.getPayUrl()).isEqualTo("http://momo.vn/pay");
        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(result.getStatus()).isEqualTo("PENDING");

        verify(paymentOrderRepository).existsByAppointmentId(1L);
        verify(momoPaymentService).createPaymentRequest(any(), anyString());
        verify(paymentOrderRepository).save(any(PaymentOrder.class));
        verify(eventPublisher).publishPaymentCreated(any());
    }

    @Test
    @DisplayName("Should prevent duplicate payment for same appointment")
    void testCreatePayment_DuplicateAppointment() {
        when(paymentOrderRepository.existsByAppointmentId(1L)).thenReturn(true);

        assertThatThrownBy(() -> paymentService.createPayment(createPaymentRequest, 100L))
                .isInstanceOf(DuplicatePaymentException.class)
                .hasMessageContaining("Payment already exists for appointment");

        verify(paymentOrderRepository).existsByAppointmentId(1L);
        verify(momoPaymentService, never()).createPaymentRequest(any(), anyString());
        verify(paymentOrderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject payment with invalid amount - too low")
    void testCreatePayment_AmountTooLow() {
        createPaymentRequest.setAmount(new BigDecimal("500.00"));

        assertThatThrownBy(() -> paymentService.createPayment(createPaymentRequest, 100L))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("at least 1,000 VND");

        verify(paymentOrderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject payment with invalid amount - too high")
    void testCreatePayment_AmountTooHigh() {
        createPaymentRequest.setAmount(new BigDecimal("9999999.00"));

        assertThatThrownBy(() -> paymentService.createPayment(createPaymentRequest, 100L))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("cannot exceed 999,999.99 VND");

        verify(paymentOrderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject payment with missing patient information")
    void testCreatePayment_MissingPatientInfo() {
        createPaymentRequest.setPatientName(null);

        assertThatThrownBy(() -> paymentService.createPayment(createPaymentRequest, 100L))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("Patient details");

        verify(paymentOrderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should create counter payment without calling Momo API")
    void testCreatePayment_CounterPayment() {
        createPaymentRequest.setPaymentMethod("CASH");
        when(paymentOrderRepository.existsByAppointmentId(1L)).thenReturn(false);

        PaymentOrder cashOrder = PaymentOrder.builder()
                .orderId("CASH123456")
                .appointmentId(1L)
                .patientId(100L)
                .amount(new BigDecimal("50000.00"))
                .paymentMethod(PaymentMethod.CASH)
                .status(PaymentStatus.PENDING)
                .build();

        when(paymentOrderRepository.save(any(PaymentOrder.class))).thenReturn(cashOrder);

        PaymentResponse result = paymentService.createPayment(createPaymentRequest, 100L);

        assertThat(result).isNotNull();
        assertThat(result.getPayUrl()).isNull();
        assertThat(result.getStatus()).isEqualTo("PENDING");

        verify(momoPaymentService, never()).createPaymentRequest(any(), anyString());
        verify(paymentOrderRepository).save(any(PaymentOrder.class));
    }

    @Test
    @DisplayName("Should handle Momo callback successfully - payment completed")
    void testHandleMomoCallback_Success() {
        MomoCallbackResponse callback = MomoCallbackResponse.builder()
                .orderId("ORDER123456789")
                .transactionId(999888777L)
                .requestId("REQ123")
                .amount(50000000L)
                .resultCode(0)
                .message("Success")
                .partnerCode("MOMO")
                .signature("valid_signature")
                .build();

        when(momoPaymentService.verifyCallback(callback)).thenReturn(true);
        when(paymentOrderRepository.findByOrderIdWithLock("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));
        when(paymentTransactionRepository.findByPaymentOrderId(1L))
                .thenReturn(Optional.of(paymentTransaction));
        when(paymentTransactionRepository.save(any())).thenReturn(paymentTransaction);
        when(paymentOrderRepository.save(any())).thenReturn(paymentOrder);

        paymentService.handleMomoCallback(callback);

        ArgumentCaptor<PaymentOrder> orderCaptor = ArgumentCaptor.forClass(PaymentOrder.class);
        verify(paymentOrderRepository).save(orderCaptor.capture());

        PaymentOrder savedOrder = orderCaptor.getValue();
        assertThat(savedOrder.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(savedOrder.getCompletedAt()).isNotNull();

        verify(eventPublisher).publishPaymentCompleted(any());
    }

    @Test
    @DisplayName("Should handle Momo callback - payment failed")
    void testHandleMomoCallback_Failed() {
        MomoCallbackResponse callback = MomoCallbackResponse.builder()
                .orderId("ORDER123456789")
                .transactionId(999888777L)
                .resultCode(1004)
                .message("Insufficient balance")
                .partnerCode("MOMO")
                .signature("valid_signature")
                .build();

        when(momoPaymentService.verifyCallback(callback)).thenReturn(true);
        when(paymentOrderRepository.findByOrderIdWithLock("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));
        when(paymentTransactionRepository.findByPaymentOrderId(1L))
                .thenReturn(Optional.of(paymentTransaction));
        when(paymentTransactionRepository.save(any())).thenReturn(paymentTransaction);
        when(paymentOrderRepository.save(any())).thenReturn(paymentOrder);

        paymentService.handleMomoCallback(callback);

        ArgumentCaptor<PaymentOrder> orderCaptor = ArgumentCaptor.forClass(PaymentOrder.class);
        verify(paymentOrderRepository).save(orderCaptor.capture());

        PaymentOrder savedOrder = orderCaptor.getValue();
        assertThat(savedOrder.getStatus()).isEqualTo(PaymentStatus.FAILED);

        verify(eventPublisher).publishPaymentFailed(any());
    }

    @Test
    @DisplayName("Should reject callback with invalid signature")
    void testHandleMomoCallback_InvalidSignature() {
        MomoCallbackResponse callback = MomoCallbackResponse.builder()
                .orderId("ORDER123456789")
                .signature("invalid_signature")
                .build();

        when(momoPaymentService.verifyCallback(callback)).thenReturn(false);

        assertThatThrownBy(() -> paymentService.handleMomoCallback(callback))
                .isInstanceOf(InvalidSignatureException.class)
                .hasMessageContaining("Invalid callback signature");

        verify(paymentOrderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should not process callback for already completed payment")
    void testHandleMomoCallback_AlreadyCompleted() {
        paymentOrder.setStatus(PaymentStatus.COMPLETED);

        MomoCallbackResponse callback = MomoCallbackResponse.builder()
                .orderId("ORDER123456789")
                .transactionId(999888777L)
                .resultCode(0)
                .signature("valid_signature")
                .build();

        when(momoPaymentService.verifyCallback(callback)).thenReturn(true);
        when(paymentOrderRepository.findByOrderIdWithLock("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));

        paymentService.handleMomoCallback(callback);

        verify(paymentOrderRepository, never()).save(any());
        verify(eventPublisher, never()).publishPaymentCompleted(any());
    }

    @Test
    @DisplayName("Should process refund successfully - full refund")
    void testRefundPayment_FullRefund() {
        paymentOrder.setStatus(PaymentStatus.COMPLETED);

        RefundPaymentRequest refundRequest = RefundPaymentRequest.builder()
                .orderId("ORDER123456789")
                .amount(new BigDecimal("50000.00"))
                .reason("Customer requested refund")
                .build();

        MomoRefundResponse momoRefundResponse = MomoRefundResponse.builder()
                .resultCode(0)
                .message("Success")
                .orderId("ORDER123456789")
                .transId(999888777L)
                .amount(50000L)
                .build();

        when(paymentOrderRepository.findByOrderId("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));
        when(refundTransactionRepository.findByPaymentOrderIdAndStatus(anyLong(), eq(RefundStatus.COMPLETED)))
                .thenReturn(Collections.emptyList());
        when(paymentTransactionRepository.findByPaymentOrderId(1L))
                .thenReturn(Optional.of(paymentTransaction));
        when(momoPaymentService.refundPayment(anyString(), anyLong(), any(), anyString()))
                .thenReturn(momoRefundResponse);
        when(refundTransactionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentOrderRepository.save(any())).thenReturn(paymentOrder);

        IPaymentService.RefundResponse result = paymentService.refundPayment(refundRequest);

        assertThat(result).isNotNull();
        assertThat(result.status).isEqualTo("COMPLETED");
        assertThat(result.amount).isEqualByComparingTo(new BigDecimal("50000.00"));

        ArgumentCaptor<PaymentOrder> orderCaptor = ArgumentCaptor.forClass(PaymentOrder.class);
        verify(paymentOrderRepository).save(orderCaptor.capture());
        assertThat(orderCaptor.getValue().getStatus()).isEqualTo(PaymentStatus.REFUNDED);

        verify(eventPublisher).publishPaymentRefunded(any());
    }

    @Test
    @DisplayName("Should process partial refund successfully")
    void testRefundPayment_PartialRefund() {
        paymentOrder.setStatus(PaymentStatus.COMPLETED);

        RefundPaymentRequest refundRequest = RefundPaymentRequest.builder()
                .orderId("ORDER123456789")
                .amount(new BigDecimal("20000.00"))
                .reason("Partial refund")
                .build();

        MomoRefundResponse momoRefundResponse = MomoRefundResponse.builder()
                .resultCode(0)
                .message("Success")
                .orderId("ORDER123456789")
                .transId(999888777L)
                .amount(20000L)
                .build();

        when(paymentOrderRepository.findByOrderId("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));
        when(refundTransactionRepository.findByPaymentOrderIdAndStatus(anyLong(), eq(RefundStatus.COMPLETED)))
                .thenReturn(Collections.emptyList());
        when(paymentTransactionRepository.findByPaymentOrderId(1L))
                .thenReturn(Optional.of(paymentTransaction));
        when(momoPaymentService.refundPayment(anyString(), anyLong(), any(), anyString()))
                .thenReturn(momoRefundResponse);
        when(refundTransactionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentOrderRepository.save(any())).thenReturn(paymentOrder);

        IPaymentService.RefundResponse result = paymentService.refundPayment(refundRequest);

        assertThat(result).isNotNull();

        ArgumentCaptor<PaymentOrder> orderCaptor = ArgumentCaptor.forClass(PaymentOrder.class);
        verify(paymentOrderRepository).save(orderCaptor.capture());
        assertThat(orderCaptor.getValue().getStatus()).isEqualTo(PaymentStatus.PARTIALLY_REFUNDED);

        verify(eventPublisher).publishPaymentRefunded(any());
    }

    @Test
    @DisplayName("Should reject refund exceeding remaining amount")
    void testRefundPayment_ExceedsRemainingAmount() {
        paymentOrder.setStatus(PaymentStatus.COMPLETED);

        RefundTransaction existingRefund = RefundTransaction.builder()
                .amount(new BigDecimal("30000.00"))
                .status(RefundStatus.COMPLETED)
                .build();

        RefundPaymentRequest refundRequest = RefundPaymentRequest.builder()
                .orderId("ORDER123456789")
                .amount(new BigDecimal("30000.00"))
                .reason("Too much refund")
                .build();

        when(paymentOrderRepository.findByOrderId("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));
        when(refundTransactionRepository.findByPaymentOrderIdAndStatus(anyLong(), eq(RefundStatus.COMPLETED)))
                .thenReturn(List.of(existingRefund));

        assertThatThrownBy(() -> paymentService.refundPayment(refundRequest))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("exceeds remaining refundable amount");

        verify(momoPaymentService, never()).refundPayment(anyString(), anyLong(), any(), anyString());
    }

    @Test
    @DisplayName("Should reject refund for non-completed payment")
    void testRefundPayment_InvalidStatus() {
        paymentOrder.setStatus(PaymentStatus.PENDING);

        RefundPaymentRequest refundRequest = RefundPaymentRequest.builder()
                .orderId("ORDER123456789")
                .amount(new BigDecimal("50000.00"))
                .reason("Invalid refund")
                .build();

        when(paymentOrderRepository.findByOrderId("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));

        assertThatThrownBy(() -> paymentService.refundPayment(refundRequest))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("Cannot refund payment with status");

        verify(momoPaymentService, never()).refundPayment(anyString(), anyLong(), any(), anyString());
    }

    @Test
    @DisplayName("Should confirm counter payment by receptionist")
    void testConfirmCounterPayment_Success() {
        ConfirmCounterPaymentRequest confirmRequest = ConfirmCounterPaymentRequest.builder()
                .paymentMethod(PaymentMethod.CASH)
                .confirmedByUserId(500L)
                .note("Received cash payment")
                .receptionistName("Receptionist 1")
                .build();

        when(paymentOrderRepository.findByOrderId("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));
        when(paymentOrderRepository.save(any())).thenReturn(paymentOrder);

        PaymentResponse result = paymentService.confirmCounterPayment("ORDER123456789", confirmRequest);

        assertThat(result).isNotNull();

        ArgumentCaptor<PaymentOrder> orderCaptor = ArgumentCaptor.forClass(PaymentOrder.class);
        verify(paymentOrderRepository).save(orderCaptor.capture());

        PaymentOrder savedOrder = orderCaptor.getValue();
        assertThat(savedOrder.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(savedOrder.getPaymentMethod()).isEqualTo(PaymentMethod.CASH);
        assertThat(savedOrder.getConfirmedByUserId()).isEqualTo(500L);
        assertThat(savedOrder.getConfirmationNote()).isEqualTo("Received cash payment");

        verify(eventPublisher).publishPaymentCompleted(any());
    }

    @Test
    @DisplayName("Should reject counter payment confirmation for online payment method")
    void testConfirmCounterPayment_InvalidMethod() {
        ConfirmCounterPaymentRequest confirmRequest = ConfirmCounterPaymentRequest.builder()
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .confirmedByUserId(500L)
                .build();

        when(paymentOrderRepository.findByOrderId("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));

        assertThatThrownBy(() -> paymentService.confirmCounterPayment("ORDER123456789", confirmRequest))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("Invalid payment method for counter payment");

        verify(paymentOrderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should cancel pending payment")
    void testCancelPayment_Success() {
        when(paymentOrderRepository.findByOrderId("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));
        when(paymentOrderRepository.save(any())).thenReturn(paymentOrder);

        paymentService.cancelPayment("ORDER123456789");

        ArgumentCaptor<PaymentOrder> orderCaptor = ArgumentCaptor.forClass(PaymentOrder.class);
        verify(paymentOrderRepository).save(orderCaptor.capture());

        PaymentOrder savedOrder = orderCaptor.getValue();
        assertThat(savedOrder.getStatus()).isEqualTo(PaymentStatus.EXPIRED);
        assertThat(savedOrder.getExpiredAt()).isNotNull();
    }

    @Test
    @DisplayName("Should not cancel completed payment")
    void testCancelPayment_AlreadyCompleted() {
        paymentOrder.setStatus(PaymentStatus.COMPLETED);

        when(paymentOrderRepository.findByOrderId("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));

        assertThatThrownBy(() -> paymentService.cancelPayment("ORDER123456789"))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("Can only cancel pending payments");

        verify(paymentOrderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should get payment by order ID")
    void testGetPaymentByOrderId() {
        when(paymentOrderRepository.findByOrderId("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));
        when(paymentTransactionRepository.findByPaymentOrderId(1L))
                .thenReturn(Optional.of(paymentTransaction));

        PaymentResponse result = paymentService.getPaymentByOrderId("ORDER123456789");

        assertThat(result).isNotNull();
        assertThat(result.getOrderId()).isEqualTo("ORDER123456789");
        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
    }

    @Test
    @DisplayName("Should map frontend-required fields in payment response")
    void testGetPaymentByOrderId_IncludesFrontendFields() {
        LocalDateTime createdAt = LocalDateTime.of(2024, 1, 2, 10, 30);
        paymentOrder.setCreatedAt(createdAt);

        when(paymentOrderRepository.findByOrderId("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));
        when(paymentTransactionRepository.findByPaymentOrderId(1L))
                .thenReturn(Optional.of(paymentTransaction));

        PaymentResponse result = paymentService.getPaymentByOrderId("ORDER123456789");

        assertFieldEquals(result, "description", "Appointment payment");
        assertFieldEquals(result, "invoiceNumber", "ORDER123456789");
        assertFieldEquals(result, "createdAt", createdAt);
        assertFieldEquals(result, "appointmentId", 1L);
        assertFieldEquals(result, "finalAmount", new BigDecimal("50000.00"));
    }

    @Test
    @DisplayName("Should throw exception when payment not found")
    void testGetPaymentByOrderId_NotFound() {
        when(paymentOrderRepository.findByOrderId("NOTFOUND"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.getPaymentByOrderId("NOTFOUND"))
                .isInstanceOf(PaymentNotFoundException.class);
    }

    @Test
    @DisplayName("Should get patient payments with pagination")
    void testGetPatientPayments() {
        List<PaymentOrder> orders = Arrays.asList(paymentOrder);
        Page<PaymentOrder> page = new PageImpl<>(orders);

        when(paymentOrderRepository.findByPatientId(eq(100L), any(Pageable.class)))
                .thenReturn(page);
        when(paymentTransactionRepository.findByPaymentOrderId(anyLong()))
                .thenReturn(Optional.of(paymentTransaction));

        Pageable pageable = PageRequest.of(0, 10);
        Page<PaymentResponse> result = paymentService.getPatientPayments(100L, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getOrderId()).isEqualTo("ORDER123456789");
    }

    @Test
    @DisplayName("Should query payment status and update from Momo")
    void testQueryPaymentStatus() {
        MomoQueryResponse queryResponse = MomoQueryResponse.builder()
                .resultCode(0)
                .message("Success")
                .orderId("ORDER123456789")
                .transId(999888777L)
                .amount(50000000L)
                .build();

        when(paymentOrderRepository.findByOrderId("ORDER123456789"))
                .thenReturn(Optional.of(paymentOrder));
        when(paymentTransactionRepository.findByPaymentOrderId(1L))
                .thenReturn(Optional.of(paymentTransaction));
        when(momoPaymentService.queryTransactionStatus(anyString(), anyString()))
                .thenReturn(queryResponse);
        when(paymentTransactionRepository.save(any())).thenReturn(paymentTransaction);
        when(paymentOrderRepository.save(any())).thenReturn(paymentOrder);

        PaymentResponse result = paymentService.queryPaymentStatus("ORDER123456789");

        assertThat(result).isNotNull();
        verify(momoPaymentService).queryTransactionStatus(anyString(), anyString());
        verify(paymentOrderRepository).save(any());
    }

    private void assertFieldEquals(PaymentResponse response, String fieldName, Object expected) {
        try {
            var field = PaymentResponse.class.getDeclaredField(fieldName);
            field.setAccessible(true);
            Object actual = field.get(response);

            if (expected instanceof BigDecimal expectedAmount && actual instanceof BigDecimal actualAmount) {
                assertThat(actualAmount).isEqualByComparingTo(expectedAmount);
            } else {
                assertThat(actual).isEqualTo(expected);
            }
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new AssertionError("Missing or inaccessible field: " + fieldName, e);
        }
    }
}
