package com.clinicbooking.paymentservice.exception;

import org.springframework.http.HttpStatus;

public class DuplicatePaymentException extends PaymentException {

    
    public DuplicatePaymentException(String orderId) {
        super(
            String.format("Payment order already exists with orderId: %s", orderId),
            HttpStatus.CONFLICT,
            "DUPLICATE_ORDER_ID"
        );
    }

    
    public DuplicatePaymentException(String message, String errorCode) {
        super(message, HttpStatus.CONFLICT, errorCode);
    }

    
    public DuplicatePaymentException(String message, String errorCode, Throwable cause) {
        super(message, HttpStatus.CONFLICT, errorCode, cause);
    }
}
