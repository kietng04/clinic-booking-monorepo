package com.clinicbooking.paymentservice.service;

import com.clinicbooking.paymentservice.dto.request.ConfirmCounterPaymentRequest;
import com.clinicbooking.paymentservice.dto.request.CreatePaymentRequest;
import com.clinicbooking.paymentservice.dto.request.RefundPaymentRequest;
import com.clinicbooking.paymentservice.dto.request.UpdatePaymentRequest;
import com.clinicbooking.paymentservice.dto.response.MomoCallbackResponse;
import com.clinicbooking.paymentservice.dto.response.PaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface IPaymentService {

    PaymentResponse createPayment(CreatePaymentRequest request, Long patientId);

    void handleMomoCallback(MomoCallbackResponse callback);

    PaymentResponse getPaymentByOrderId(String orderId);

    PaymentResponse updatePayment(String orderId, UpdatePaymentRequest request);

    void cancelPayment(String orderId);

    PaymentResponse getPaymentByAppointmentId(Long appointmentId);

    Page<PaymentResponse> getPatientPayments(Long patientId, Pageable pageable);

    RefundResponse refundPayment(RefundPaymentRequest request);

    PaymentResponse queryPaymentStatus(String orderId);

    byte[] exportPatientPaymentsCsv(Long patientId, LocalDateTime fromDate, LocalDateTime toDate);

    /**
     * Confirm counter payment by receptionist
     * Used when patient pays cash/bank transfer/card at clinic counter
     *
     * @param orderId Order ID of the payment
     * @param request Confirmation details including payment method and receptionist info
     * @return Updated payment response
     */
    PaymentResponse confirmCounterPayment(String orderId, ConfirmCounterPaymentRequest request);

    /**
     * Get all pending counter payments
     * Used by receptionist dashboard to see payments waiting for confirmation
     *
     * @param pageable Pagination parameters
     * @return Page of pending counter payments
     */
    Page<PaymentResponse> getPendingCounterPayments(Pageable pageable);

    
    class RefundResponse {
        public String refundId;
        public String status;
        public java.math.BigDecimal amount;

        public RefundResponse(String refundId, String status, java.math.BigDecimal amount) {
            this.refundId = refundId;
            this.status = status;
            this.amount = amount;
        }
    }
}
