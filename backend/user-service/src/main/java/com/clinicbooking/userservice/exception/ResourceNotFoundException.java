package com.clinicbooking.userservice.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a requested resource is not found
 */
public class ResourceNotFoundException extends ApiException {

    /**
     * Constructor with message
     *
     * @param message the exception message
     */
    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }

    /**
     * Constructor with message and error code
     *
     * @param message the exception message
     * @param errorCode the error code
     */
    public ResourceNotFoundException(String message, String errorCode) {
        super(message, HttpStatus.NOT_FOUND, errorCode);
    }

    /**
     * Constructor with message and cause
     *
     * @param message the exception message
     * @param cause the cause throwable
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, HttpStatus.NOT_FOUND, HttpStatus.NOT_FOUND.getReasonPhrase(), cause);
    }

    /**
     * Factory method to create ResourceNotFoundException for entity
     *
     * @param entityName the name of the entity
     * @param id the id of the entity
     * @return the ResourceNotFoundException
     */
    public static ResourceNotFoundException notFound(String entityName, Object id) {
        return new ResourceNotFoundException(
            String.format("%s with ID %s not found", entityName, id),
            "RESOURCE_NOT_FOUND"
        );
    }

    /**
     * Factory method to create ResourceNotFoundException for entity by field
     *
     * @param entityName the name of the entity
     * @param fieldName the name of the field
     * @param fieldValue the value of the field
     * @return the ResourceNotFoundException
     */
    public static ResourceNotFoundException notFoundByField(String entityName, String fieldName, Object fieldValue) {
        return new ResourceNotFoundException(
            String.format("%s with %s '%s' not found", entityName, fieldName, fieldValue),
            "RESOURCE_NOT_FOUND"
        );
    }
}
