package com.clinicbooking.userservice.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a user is not authorized to perform an action
 */
public class UnauthorizedException extends ApiException {

    /**
     * Constructor with message
     *
     * @param message the exception message
     */
    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Constructor with message and error code
     *
     * @param message the exception message
     * @param errorCode the error code
     */
    public UnauthorizedException(String message, String errorCode) {
        super(message, HttpStatus.UNAUTHORIZED, errorCode);
    }

    /**
     * Constructor with message and cause
     *
     * @param message the exception message
     * @param cause the cause throwable
     */
    public UnauthorizedException(String message, Throwable cause) {
        super(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", cause);
    }

    /**
     * Factory method for authentication error
     *
     * @return the UnauthorizedException
     */
    public static UnauthorizedException authenticationFailed() {
        return new UnauthorizedException(
            "Authentication failed. Invalid credentials",
            "AUTHENTICATION_FAILED"
        );
    }

    /**
     * Factory method for missing token
     *
     * @return the UnauthorizedException
     */
    public static UnauthorizedException missingToken() {
        return new UnauthorizedException(
            "Authorization token is missing",
            "MISSING_TOKEN"
        );
    }

    /**
     * Factory method for invalid token
     *
     * @return the UnauthorizedException
     */
    public static UnauthorizedException invalidToken() {
        return new UnauthorizedException(
            "Authorization token is invalid or expired",
            "INVALID_TOKEN"
        );
    }

    /**
     * Factory method for insufficient permissions
     *
     * @param requiredRole the required role
     * @return the UnauthorizedException
     */
    public static UnauthorizedException insufficientPermissions(String requiredRole) {
        return new UnauthorizedException(
            String.format("Insufficient permissions. Required role: %s", requiredRole),
            "INSUFFICIENT_PERMISSIONS"
        );
    }
}
