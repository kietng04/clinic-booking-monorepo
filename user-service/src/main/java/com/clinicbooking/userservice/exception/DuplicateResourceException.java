package com.clinicbooking.userservice.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when attempting to create a duplicate resource
 */
public class DuplicateResourceException extends ApiException {

    /**
     * Constructor with message
     *
     * @param message the exception message
     */
    public DuplicateResourceException(String message) {
        super(message, HttpStatus.CONFLICT);
    }

    /**
     * Constructor with message and error code
     *
     * @param message the exception message
     * @param errorCode the error code
     */
    public DuplicateResourceException(String message, String errorCode) {
        super(message, HttpStatus.CONFLICT, errorCode);
    }

    /**
     * Constructor with message and cause
     *
     * @param message the exception message
     * @param cause the cause throwable
     */
    public DuplicateResourceException(String message, Throwable cause) {
        super(message, HttpStatus.CONFLICT, "DUPLICATE_RESOURCE", cause);
    }

    /**
     * Factory method to create DuplicateResourceException for entity
     *
     * @param entityName the name of the entity
     * @param fieldName the name of the field
     * @param fieldValue the value of the field
     * @return the DuplicateResourceException
     */
    public static DuplicateResourceException duplicate(String entityName, String fieldName, Object fieldValue) {
        return new DuplicateResourceException(
            String.format("%s with %s '%s' already exists", entityName, fieldName, fieldValue),
            "DUPLICATE_RESOURCE"
        );
    }

    /**
     * Factory method to create DuplicateResourceException for email
     *
     * @param email the duplicate email
     * @return the DuplicateResourceException
     */
    public static DuplicateResourceException emailAlreadyExists(String email) {
        return new DuplicateResourceException(
            String.format("User with email '%s' already exists", email),
            "EMAIL_ALREADY_EXISTS"
        );
    }

    /**
     * Factory method to create DuplicateResourceException for username
     *
     * @param username the duplicate username
     * @return the DuplicateResourceException
     */
    public static DuplicateResourceException usernameAlreadyExists(String username) {
        return new DuplicateResourceException(
            String.format("User with username '%s' already exists", username),
            "USERNAME_ALREADY_EXISTS"
        );
    }
}
