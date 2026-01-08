package com.clinicbooking.paymentservice.service;

import com.clinicbooking.paymentservice.dto.request.CreatePaymentRequest;
import com.clinicbooking.paymentservice.dto.request.RefundPaymentRequest;
import com.clinicbooking.paymentservice.dto.response.MomoCallbackResponse;
import com.clinicbooking.paymentservice.dto.response.PaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IPaymentService {

    
    PaymentResponse createPayment(CreatePaymentRequest request, Long patientId);

    
    void handleMomoCallback(MomoCallbackResponse callback);

    
    PaymentResponse getPaymentByOrderId(String orderId);

    
    PaymentResponse getPaymentByAppointmentId(Long appointmentId);

    
    Page<PaymentResponse> getPatientPayments(Long patientId, Pageable pageable);

    
    RefundResponse refundPayment(RefundPaymentRequest request);

    
    PaymentResponse queryPaymentStatus(String orderId);

    
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
