package com.clinicbooking.paymentservice.exception;

import org.springframework.http.HttpStatus;

public class PaymentException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    
    public PaymentException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.errorCode = status.getReasonPhrase();
    }

    
    public PaymentException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    
    public PaymentException(String message, HttpStatus status, String errorCode, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.errorCode = errorCode;
    }

    
    public HttpStatus getStatus() {
        return status;
    }

    
    public String getErrorCode() {
        return errorCode;
    }
}
