package com.clinicbooking.paymentservice.exception;

import org.springframework.http.HttpStatus;

public class MomoException extends PaymentException {

    
    public MomoException(String message) {
        super(message, HttpStatus.BAD_GATEWAY, "MOMO_API_ERROR");
    }

    
    public MomoException(String message, HttpStatus status) {
        super(message, status, "MOMO_API_ERROR");
    }

    
    public MomoException(String message, HttpStatus status, String errorCode) {
        super(message, status, errorCode);
    }

    
    public MomoException(String message, HttpStatus status, String errorCode, Throwable cause) {
        super(message, status, errorCode, cause);
    }
}
