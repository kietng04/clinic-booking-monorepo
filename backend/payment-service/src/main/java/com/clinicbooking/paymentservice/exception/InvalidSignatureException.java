package com.clinicbooking.paymentservice.exception;

import org.springframework.http.HttpStatus;

public class InvalidSignatureException extends PaymentException {

    
    public InvalidSignatureException() {
        super(
            "Invalid signature. Payment callback verification failed.",
            HttpStatus.BAD_REQUEST,
            "INVALID_SIGNATURE"
        );
    }

    
    public InvalidSignatureException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "INVALID_SIGNATURE");
    }

    
    public InvalidSignatureException(String message, Throwable cause) {
        super(message, HttpStatus.BAD_REQUEST, "INVALID_SIGNATURE", cause);
    }

    
    public InvalidSignatureException(String message, String errorCode) {
        super(message, HttpStatus.BAD_REQUEST, errorCode);
    }

    
    public InvalidSignatureException(String message, String errorCode, Throwable cause) {
        super(message, HttpStatus.BAD_REQUEST, errorCode, cause);
    }
}
