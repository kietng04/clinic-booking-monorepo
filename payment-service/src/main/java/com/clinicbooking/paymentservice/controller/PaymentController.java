package com.clinicbooking.paymentservice.controller;

import com.clinicbooking.paymentservice.dto.request.ConfirmCounterPaymentRequest;
import com.clinicbooking.paymentservice.dto.request.CreatePaymentRequest;
import com.clinicbooking.paymentservice.dto.request.RefundPaymentRequest;
import com.clinicbooking.paymentservice.dto.request.UpdatePaymentRequest;
import com.clinicbooking.paymentservice.dto.response.PaymentResponse;
import com.clinicbooking.paymentservice.dto.response.PaymentStatusResponse;
import com.clinicbooking.paymentservice.security.CustomUserDetails;
import com.clinicbooking.paymentservice.service.IPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Payments", description = "Payment Processing API")
public class PaymentController {

    private final IPaymentService paymentService;

    
    @PostMapping
    @Operation(
            summary = "Create a new payment order",
            description = "Initiates payment for an appointment and generates Momo payment URL"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Payment created successfully",
                    content = @Content(schema = @Schema(implementation = PaymentResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "409", description = "Payment already exists for this appointment"),
            @ApiResponse(responseCode = "500", description = "Momo API error or server error")
    })
    public ResponseEntity<PaymentResponse> createPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreatePaymentRequest request) {

        Long patientId = userDetails.getUserId();

        log.info(
                "Creating payment - PatientId: {}, AppointmentId: {}, Amount: {}, PaymentMethod: {}",
                patientId,
                request.getAppointmentId(),
                request.getAmount(),
                request.getPaymentMethod()
        );

        PaymentResponse response = paymentService.createPayment(request, patientId);

        log.info(
                "Payment created successfully - PatientId: {}, OrderId: {}, AppointmentId: {}",
                patientId,
                response.getOrderId(),
                request.getAppointmentId()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    
    @GetMapping("/{orderId}")
    @Operation(
            summary = "Get payment details by order ID",
            description = "Retrieve complete payment information including transaction details"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Payment details retrieved",
                    content = @Content(schema = @Schema(implementation = PaymentResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Payment order not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User does not own this payment"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "Unique order ID", example = "ORD202401081234567890")
            @PathVariable String orderId) {

        Long patientId = userDetails.getUserId();

        log.info("Fetching payment - PatientId: {}, OrderId: {}", patientId, orderId);

        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);

        if (response != null && !patientId.equals(response.getPatientId())) {
            log.warn("Unauthorized access attempt - PatientId: {}, OrderId: {}, Owner: {}",
                     patientId, orderId, response.getPatientId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(response);
    }


    @PutMapping("/{orderId}")
    @Operation(
            summary = "Update payment details",
            description = "Update non-financial payment information. Only pending payments can be updated."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Payment updated successfully",
                    content = @Content(schema = @Schema(implementation = PaymentResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid payment status for update"),
            @ApiResponse(responseCode = "404", description = "Payment not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User does not own this payment")
    })
    public ResponseEntity<PaymentResponse> updatePayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "Unique order ID") @PathVariable String orderId,
            @Valid @RequestBody UpdatePaymentRequest request) {

        Long patientId = userDetails.getUserId();

        log.info("Updating payment - PatientId: {}, OrderId: {}", patientId, orderId);

        // Check ownership
        PaymentResponse existingPayment = paymentService.getPaymentByOrderId(orderId);
        if (!patientId.equals(existingPayment.getPatientId())) {
            log.warn("Unauthorized update attempt - PatientId: {}, OrderId: {}, Owner: {}",
                    patientId, orderId, existingPayment.getPatientId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        PaymentResponse response = paymentService.updatePayment(orderId, request);
        log.info("Payment updated successfully - OrderId: {}", orderId);

        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{orderId}")
    @Operation(
            summary = "Cancel payment",
            description = "Cancel a pending payment. Only pending payments can be cancelled."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Payment cancelled successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid payment status for cancellation"),
            @ApiResponse(responseCode = "404", description = "Payment not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User does not own this payment")
    })
    public ResponseEntity<Void> cancelPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "Unique order ID") @PathVariable String orderId) {

        Long patientId = userDetails.getUserId();

        log.info("Cancelling payment - PatientId: {}, OrderId: {}", patientId, orderId);

        // Check ownership
        PaymentResponse existingPayment = paymentService.getPaymentByOrderId(orderId);
        if (!patientId.equals(existingPayment.getPatientId())) {
            log.warn("Unauthorized cancellation attempt - PatientId: {}, OrderId: {}, Owner: {}",
                    patientId, orderId, existingPayment.getPatientId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        paymentService.cancelPayment(orderId);
        log.info("Payment cancelled successfully - OrderId: {}", orderId);

        return ResponseEntity.noContent().build();
    }


    @GetMapping("/appointment/{appointmentId}")
    @Operation(
            summary = "Get payment by appointment ID",
            description = "Retrieve payment details for a specific appointment"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Payment found",
                    content = @Content(schema = @Schema(implementation = PaymentResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Payment not found for appointment"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User does not own this payment"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<PaymentResponse> getPaymentByAppointmentId(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "Appointment ID", example = "123")
            @PathVariable Long appointmentId) {

        Long patientId = userDetails.getUserId();

        log.info("Fetching payment by appointment - PatientId: {}, AppointmentId: {}", patientId, appointmentId);

        PaymentResponse response = paymentService.getPaymentByAppointmentId(appointmentId);

        if (response != null && !patientId.equals(response.getPatientId())) {
            log.warn("Unauthorized access attempt - PatientId: {}, AppointmentId: {}", patientId, appointmentId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/my-payments")
    @Operation(
            summary = "Get patient's payment history",
            description = "Retrieve all payments made by authenticated patient with pagination support"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Payment history retrieved",
                    content = @Content(schema = @Schema(implementation = PaymentResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Page<PaymentResponse>> getMyPayments(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PageableDefault(size = 10, page = 0, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        Long patientId = userDetails.getUserId();

        log.info(
                "Fetching payment history - PatientId: {}, Page: {}, Size: {}",
                patientId,
                pageable.getPageNumber(),
                pageable.getPageSize()
        );

        Page<PaymentResponse> payments = paymentService.getPatientPayments(patientId, pageable);

        log.debug("Payment history retrieved - PatientId: {}, TotalElements: {}", patientId, payments.getTotalElements());

        return ResponseEntity.ok(payments);
    }

    
    @GetMapping("/{orderId}/status")
    @Operation(
            summary = "Query payment status from Momo",
            description = "Synchronize payment status with Momo system and get current state"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Payment status retrieved",
                    content = @Content(schema = @Schema(implementation = PaymentResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Payment order not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User does not own this payment"),
            @ApiResponse(responseCode = "500", description = "Momo API error")
    })
    public ResponseEntity<PaymentResponse> getPaymentStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "Order ID", example = "ORD202401081234567890")
            @PathVariable String orderId) {

        Long patientId = userDetails.getUserId();

        log.info("Querying payment status from Momo - PatientId: {}, OrderId: {}", patientId, orderId);

        PaymentResponse response = paymentService.queryPaymentStatus(orderId);

        if (response != null && !patientId.equals(response.getPatientId())) {
            log.warn("Unauthorized status query - PatientId: {}, OrderId: {}", patientId, orderId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("Payment status queried - PatientId: {}, OrderId: {}, Status: {}", patientId, orderId, response.getStatus());

        return ResponseEntity.ok(response);
    }

    
    @PostMapping("/refund")
    @Operation(
            summary = "Request refund for a payment",
            description = "Initiate refund process for a completed payment order"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Refund initiated successfully",
                    content = @Content(schema = @Schema(implementation = IPaymentService.RefundResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid refund request"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User does not own this payment"),
            @ApiResponse(responseCode = "404", description = "Payment not found"),
            @ApiResponse(responseCode = "409", description = "Payment cannot be refunded (not completed)"),
            @ApiResponse(responseCode = "500", description = "Momo API error")
    })
    public ResponseEntity<IPaymentService.RefundResponse> requestRefund(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody RefundPaymentRequest request) {

        Long patientId = userDetails.getUserId();

        log.info(
                "Requesting refund - PatientId: {}, OrderId: {}, RefundAmount: {}, Reason: {}",
                patientId,
                request.getOrderId(),
                request.getAmount(),
                request.getReason()
        );

        PaymentResponse payment = paymentService.getPaymentByOrderId(request.getOrderId());
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }

        if (!patientId.equals(payment.getPatientId())) {
            log.warn("Unauthorized refund attempt - PatientId: {}, OrderId: {}, Owner: {}",
                     patientId, request.getOrderId(), payment.getPatientId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        IPaymentService.RefundResponse refundResponse = paymentService.refundPayment(request);

        log.info("Refund requested - PatientId: {}, OrderId: {}, RefundId: {}", patientId, request.getOrderId(), refundResponse.refundId);

        return ResponseEntity.status(HttpStatus.CREATED).body(refundResponse);
    }


    @GetMapping("/{orderId}/refunds")
    @Operation(
            summary = "Get refund history for a payment",
            description = "Retrieve all refund transactions for a payment order"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Refund history retrieved",
                    content = @Content(schema = @Schema(implementation = PaymentResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Payment order not found")
    })
    public ResponseEntity<PaymentResponse> getRefundHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "Order ID", example = "ORD202401081234567890")
            @PathVariable String orderId) {

        Long patientId = userDetails.getUserId();

        log.info("Fetching refund history - PatientId: {}, OrderId: {}", patientId, orderId);

        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);

        return ResponseEntity.ok(response);
    }

    // ========== COUNTER PAYMENT ENDPOINTS (Receptionist Only) ==========

    @PostMapping("/{orderId}/confirm-counter-payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(
            summary = "Confirm counter payment (Receptionist only)",
            description = "Confirm that patient has paid cash/bank transfer/card at clinic counter. " +
                         "This endpoint is only accessible by receptionist and admin users.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Counter payment confirmed successfully",
                    content = @Content(schema = @Schema(implementation = PaymentResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid payment status or method"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Requires RECEPTIONIST or ADMIN role"),
            @ApiResponse(responseCode = "404", description = "Payment order not found")
    })
    public ResponseEntity<PaymentResponse> confirmCounterPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "Order ID", example = "ORD202401081234567890")
            @PathVariable String orderId,
            @Valid @RequestBody ConfirmCounterPaymentRequest request) {

        Long receptionistId = userDetails.getUserId();
        String receptionistName = userDetails.getUsername();

        log.info(
                "Confirming counter payment - ReceptionistId: {}, OrderId: {}, PaymentMethod: {}",
                receptionistId,
                orderId,
                request.getPaymentMethod()
        );

        // Set receptionist details
        request.setConfirmedByUserId(receptionistId);
        request.setReceptionistName(receptionistName);

        PaymentResponse response = paymentService.confirmCounterPayment(orderId, request);

        log.info(
                "Counter payment confirmed - ReceptionistId: {}, OrderId: {}, PaymentMethod: {}",
                receptionistId,
                orderId,
                request.getPaymentMethod()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending-counter-payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(
            summary = "Get pending counter payments (Receptionist only)",
            description = "Retrieve all payment orders waiting for counter payment confirmation. " +
                         "Used by receptionist dashboard to see patients who need to pay at counter.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Pending counter payments retrieved",
                    content = @Content(schema = @Schema(implementation = PaymentResponse.class))
            ),
            @ApiResponse(responseCode = "403", description = "Forbidden - Requires RECEPTIONIST or ADMIN role")
    })
    public ResponseEntity<Page<PaymentResponse>> getPendingCounterPayments(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.ASC)
            Pageable pageable) {

        Long receptionistId = userDetails.getUserId();

        log.info(
                "Fetching pending counter payments - ReceptionistId: {}, Page: {}, Size: {}",
                receptionistId,
                pageable.getPageNumber(),
                pageable.getPageSize()
        );

        Page<PaymentResponse> pendingPayments = paymentService.getPendingCounterPayments(pageable);

        log.debug(
                "Pending counter payments retrieved - ReceptionistId: {}, TotalElements: {}",
                receptionistId,
                pendingPayments.getTotalElements()
        );

        return ResponseEntity.ok(pendingPayments);
    }
}
