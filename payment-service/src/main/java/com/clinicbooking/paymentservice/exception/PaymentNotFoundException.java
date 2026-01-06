package com.clinicbooking.paymentservice.exception;

import org.springframework.http.HttpStatus;

public class PaymentNotFoundException extends PaymentException {

    
    public PaymentNotFoundException(String orderId) {
        super(
            String.format("Payment order not found with orderId: %s", orderId),
            HttpStatus.NOT_FOUND,
            "PAYMENT_NOT_FOUND"
        );
    }

    
    public PaymentNotFoundException(String orderId, String message) {
        super(message, HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND");
    }

    
    public PaymentNotFoundException(String message, String errorCode, Throwable cause) {
        super(message, HttpStatus.NOT_FOUND, errorCode, cause);
    }
}
