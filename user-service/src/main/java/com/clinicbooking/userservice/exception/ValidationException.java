package com.clinicbooking.userservice.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when validation fails
 */
public class ValidationException extends ApiException {

    /**
     * Constructor with message
     *
     * @param message the exception message
     */
    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }

    /**
     * Constructor with message and error code
     *
     * @param message the exception message
     * @param errorCode the error code
     */
    public ValidationException(String message, String errorCode) {
        super(message, HttpStatus.BAD_REQUEST, errorCode);
    }

    /**
     * Constructor with message and cause
     *
     * @param message the exception message
     * @param cause the cause throwable
     */
    public ValidationException(String message, Throwable cause) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", cause);
    }

    /**
     * Factory method to create ValidationException for field
     *
     * @param fieldName the name of the field
     * @param message the validation message
     * @return the ValidationException
     */
    public static ValidationException fieldValidation(String fieldName, String message) {
        return new ValidationException(
            String.format("Field '%s': %s", fieldName, message),
            "FIELD_VALIDATION_ERROR"
        );
    }
}
