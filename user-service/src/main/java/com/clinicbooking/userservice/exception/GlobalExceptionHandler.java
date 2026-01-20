package com.clinicbooking.userservice.exception;

import com.clinicbooking.userservice.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Global exception handler for all API endpoints
 * Handles custom exceptions and Spring exceptions uniformly
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String TIMESTAMP_PATTERN = "yyyy-MM-dd'T'HH:mm:ss";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern(TIMESTAMP_PATTERN);

    /**
     * Handle ApiException and its subclasses
     *
     * @param ex the exception
     * @param request the request
     * @return error response entity
     */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(
            ApiException ex,
            HttpServletRequest request) {

        String correlationId = getOrCreateCorrelationId(request);
        String path = request.getRequestURI();
        String timestamp = LocalDateTime.now().format(DATE_FORMATTER);

        log.error(
            "API Exception - CorrelationID: {}, Status: {}, ErrorCode: {}, Message: {}, Path: {}",
            correlationId,
            ex.getStatus().value(),
            ex.getErrorCode(),
            ex.getMessage(),
            path,
            ex
        );

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(timestamp)
                .status(ex.getStatus().value())
                .error(ex.getStatus().getReasonPhrase())
                .message(ex.getMessage())
                .path(path)
                .errorCode(ex.getErrorCode())
                .correlationId(correlationId)
                .build();

        return ResponseEntity
                .status(ex.getStatus())
                .body(errorResponse);
    }

    /**
     * Handle ResourceNotFoundException
     *
     * @param ex the exception
     * @param request the request
     * @return error response entity
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex,
            HttpServletRequest request) {

        return handleApiException(ex, request);
    }

    /**
     * Handle ValidationException
     *
     * @param ex the exception
     * @param request the request
     * @return error response entity
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            ValidationException ex,
            HttpServletRequest request) {

        return handleApiException(ex, request);
    }

    /**
     * Handle UnauthorizedException
     *
     * @param ex the exception
     * @param request the request
     * @return error response entity
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(
            UnauthorizedException ex,
            HttpServletRequest request) {

        return handleApiException(ex, request);
    }

    /**
     * Handle DuplicateResourceException
     *
     * @param ex the exception
     * @param request the request
     * @return error response entity
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResourceException(
            DuplicateResourceException ex,
            HttpServletRequest request) {

        return handleApiException(ex, request);
    }

    /**
     * Handle ConstraintViolationException (from @Valid validation on path/query parameters)
     *
     * @param ex the exception
     * @param request the request
     * @return error response entity
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException ex,
            HttpServletRequest request) {

        String correlationId = getOrCreateCorrelationId(request);
        String path = request.getRequestURI();
        String timestamp = LocalDateTime.now().format(DATE_FORMATTER);

        // Extract field errors from constraint violations
        Map<String, Object> fieldErrors = new LinkedHashMap<>();
        Set<ConstraintViolation<?>> violations = ex.getConstraintViolations();

        for (ConstraintViolation<?> violation : violations) {
            String fieldName = violation.getPropertyPath().toString();
            String message = violation.getMessage();
            fieldErrors.put(fieldName, message);

            log.warn(
                "Constraint Violation - CorrelationID: {}, Field: {}, Message: {}, Path: {}",
                correlationId,
                fieldName,
                message,
                path
            );
        }

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(timestamp)
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Validation failed for request parameters")
                .path(path)
                .errorCode("CONSTRAINT_VIOLATION")
                .details(fieldErrors)
                .correlationId(correlationId)
                .build();

        log.error(
            "Constraint Violation Exception - CorrelationID: {}, Status: {}, Details: {}",
            correlationId,
            HttpStatus.BAD_REQUEST.value(),
            fieldErrors
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    /**
     * Handle MethodArgumentNotValidException (from @Valid validation on request body)
     *
     * @param ex the exception
     * @param request the request
     * @return error response entity
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        String correlationId = getOrCreateCorrelationId(request);
        String path = request.getRequestURI();
        String timestamp = LocalDateTime.now().format(DATE_FORMATTER);

        // Extract field errors from binding result
        Map<String, Object> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(
                        error.getField(),
                        error.getDefaultMessage()
                )
        );

        // Log each field error
        fieldErrors.forEach((field, message) ->
                log.warn(
                    "Field Validation Error - CorrelationID: {}, Field: {}, Message: {}, Path: {}",
                    correlationId,
                    field,
                    message,
                    path
                )
        );

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(timestamp)
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Validation failed for request body")
                .path(path)
                .errorCode("METHOD_ARGUMENT_NOT_VALID")
                .details(fieldErrors)
                .correlationId(correlationId)
                .build();

        log.error(
            "Method Argument Not Valid Exception - CorrelationID: {}, Status: {}, Details: {}",
            correlationId,
            HttpStatus.BAD_REQUEST.value(),
            fieldErrors
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    /**
     * Handle all other uncaught exceptions
     *
     * @param ex the exception
     * @param request the request
     * @return error response entity
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        String correlationId = getOrCreateCorrelationId(request);
        String path = request.getRequestURI();
        String timestamp = LocalDateTime.now().format(DATE_FORMATTER);

        log.error(
            "Unexpected Exception - CorrelationID: {}, Status: {}, Message: {}, Path: {}",
            correlationId,
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            ex.getMessage(),
            path,
            ex
        );

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(timestamp)
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("An unexpected error occurred. Please contact support.")
                .path(path)
                .errorCode("INTERNAL_SERVER_ERROR")
                .correlationId(correlationId)
                .build();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
    }

    /**
     * Get correlation ID from request header or create a new one
     *
     * @param request the HTTP request
     * @return correlation ID
     */
    private String getOrCreateCorrelationId(HttpServletRequest request) {
        String correlationId = request.getHeader("X-Correlation-ID");
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }
        return correlationId;
    }
}
