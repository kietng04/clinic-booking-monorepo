package com.clinicbooking.userservice.exception;

import org.springframework.http.HttpStatus;

/**
 * Base custom exception class for API errors
 * All custom exceptions should extend this class
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    /**
     * Constructor with message and HTTP status
     *
     * @param message the exception message
     * @param status the HTTP status code
     */
    public ApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.errorCode = status.getReasonPhrase();
    }

    /**
     * Constructor with message, HTTP status, and error code
     *
     * @param message the exception message
     * @param status the HTTP status code
     * @param errorCode the error code
     */
    public ApiException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    /**
     * Constructor with message, HTTP status, error code and cause
     *
     * @param message the exception message
     * @param status the HTTP status code
     * @param errorCode the error code
     * @param cause the cause throwable
     */
    public ApiException(String message, HttpStatus status, String errorCode, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.errorCode = errorCode;
    }

    /**
     * Get the HTTP status code
     *
     * @return the HTTP status
     */
    public HttpStatus getStatus() {
        return status;
    }

    /**
     * Get the error code
     *
     * @return the error code
     */
    public String getErrorCode() {
        return errorCode;
    }
}
