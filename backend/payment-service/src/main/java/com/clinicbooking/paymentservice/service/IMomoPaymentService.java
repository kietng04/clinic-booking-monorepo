package com.clinicbooking.paymentservice.service;

import com.clinicbooking.paymentservice.dto.request.CreatePaymentRequest;
import com.clinicbooking.paymentservice.dto.response.MomoCallbackResponse;
import com.clinicbooking.paymentservice.dto.response.MomoQueryResponse;
import com.clinicbooking.paymentservice.dto.response.MomoRefundResponse;
import com.clinicbooking.paymentservice.dto.response.PaymentResponse;
import com.clinicbooking.paymentservice.exception.MomoException;

import java.math.BigDecimal;

public interface IMomoPaymentService {

    
    PaymentResponse createPaymentRequest(CreatePaymentRequest request, String orderId) throws MomoException;

    
    boolean verifyCallback(MomoCallbackResponse callback) throws MomoException;

    
    MomoQueryResponse queryTransactionStatus(String orderId, String requestId) throws MomoException;

    
    MomoRefundResponse refundPayment(String orderId, Long transId, BigDecimal amount, String reason) throws MomoException;
}
