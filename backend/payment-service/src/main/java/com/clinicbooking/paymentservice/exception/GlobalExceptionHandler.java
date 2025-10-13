package com.clinicbooking.paymentservice.exception;

import com.clinicbooking.paymentservice.dto.ErrorResponse;
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

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String TIMESTAMP_PATTERN = "yyyy-MM-dd'T'HH:mm:ss";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern(TIMESTAMP_PATTERN);

    
    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<ErrorResponse> handlePaymentException(
            PaymentException ex,
            HttpServletRequest request) {

        String correlationId = getOrCreateCorrelationId(request);
        String path = request.getRequestURI();
        String timestamp = LocalDateTime.now().format(DATE_FORMATTER);

        log.error(
            "Payment Exception - CorrelationID: {}, Status: {}, ErrorCode: {}, Message: {}, Path: {}",
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

    
    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePaymentNotFoundException(
            PaymentNotFoundException ex,
            HttpServletRequest request) {

        return handlePaymentException(ex, request);
    }

    
    @ExceptionHandler(InvalidSignatureException.class)
    public ResponseEntity<ErrorResponse> handleInvalidSignatureException(
            InvalidSignatureException ex,
            HttpServletRequest request) {

        return handlePaymentException(ex, request);
    }

    
    @ExceptionHandler(MomoException.class)
    public ResponseEntity<ErrorResponse> handleMomoException(
            MomoException ex,
            HttpServletRequest request) {

        return handlePaymentException(ex, request);
    }

    
    @ExceptionHandler(DuplicatePaymentException.class)
    public ResponseEntity<ErrorResponse> handleDuplicatePaymentException(
            DuplicatePaymentException ex,
            HttpServletRequest request) {

        return handlePaymentException(ex, request);
    }

    
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException ex,
            HttpServletRequest request) {

        String correlationId = getOrCreateCorrelationId(request);
        String path = request.getRequestURI();
        String timestamp = LocalDateTime.now().format(DATE_FORMATTER);

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

    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        String correlationId = getOrCreateCorrelationId(request);
        String path = request.getRequestURI();
        String timestamp = LocalDateTime.now().format(DATE_FORMATTER);

        Map<String, Object> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(
                        error.getField(),
                        error.getDefaultMessage()
                )
        );

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

    
    private String getOrCreateCorrelationId(HttpServletRequest request) {
        String correlationId = request.getHeader("X-Correlation-ID");
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }
        return correlationId;
    }
}
