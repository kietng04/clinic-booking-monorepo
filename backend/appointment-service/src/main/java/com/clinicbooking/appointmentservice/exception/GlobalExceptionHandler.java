package com.clinicbooking.appointmentservice.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final String APPOINTMENT_OVERLAP_CONSTRAINT = "appointments_no_active_overlap";
    private static final String APPOINTMENT_SLOT_CONFLICT_MESSAGE =
            "Khung giờ này vừa được người khác đặt. Vui lòng chọn khung giờ khác.";

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(
            ValidationException ex,
            HttpServletRequest request) {
        return buildError(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                "VALIDATION_ERROR",
                request,
                null
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex,
            HttpServletRequest request) {
        return buildError(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                "RESOURCE_NOT_FOUND",
                request,
                null
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        Map<String, Object> details = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fieldError ->
                details.put(fieldError.getField(), fieldError.getDefaultMessage()));

        String message = details.values().stream()
                .findFirst()
                .map(Object::toString)
                .orElse("Dữ liệu không hợp lệ");

        return buildError(
                HttpStatus.BAD_REQUEST,
                message,
                "METHOD_ARGUMENT_NOT_VALID",
                request,
                details
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(
            ResponseStatusException ex,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = ex.getReason() != null && !ex.getReason().isBlank()
                ? ex.getReason()
                : status.getReasonPhrase();
        return buildError(status, message, status.name(), request, null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {
        if (containsConstraint(ex, APPOINTMENT_OVERLAP_CONSTRAINT)) {
            log.info("Appointment slot conflict rejected by database constraint: {}", APPOINTMENT_OVERLAP_CONSTRAINT);
            return buildError(
                    HttpStatus.CONFLICT,
                    APPOINTMENT_SLOT_CONFLICT_MESSAGE,
                    "APPOINTMENT_SLOT_CONFLICT",
                    request,
                    Map.of("constraint", APPOINTMENT_OVERLAP_CONSTRAINT)
            );
        }

        String correlationId = resolveCorrelationId(request);
        log.warn("Data integrity violation (correlationId={}, path={})", correlationId, request.getRequestURI(), ex);
        return buildError(
                HttpStatus.CONFLICT,
                "Dữ liệu bị trùng hoặc vi phạm ràng buộc",
                "DATA_INTEGRITY_VIOLATION",
                request,
                null
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {
        // Ensure unexpected 5xx errors are diagnosable from logs.
        String correlationId = resolveCorrelationId(request);
        log.error("Unhandled exception (correlationId={}, path={})", correlationId, request.getRequestURI(), ex);
        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please try again later.",
                "INTERNAL_SERVER_ERROR",
                request,
                null
        );
    }

    private ResponseEntity<ApiErrorResponse> buildError(
            HttpStatus status,
            String message,
            String errorCode,
            HttpServletRequest request,
            Map<String, Object> details) {
        ApiErrorResponse body = new ApiErrorResponse(
                OffsetDateTime.now().toString(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                errorCode,
                resolveCorrelationId(request),
                details
        );
        return ResponseEntity.status(status).body(body);
    }

    private String resolveCorrelationId(HttpServletRequest request) {
        String correlationId = request.getHeader("X-Correlation-Id");
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = request.getHeader("X-Correlation-ID");
        }
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }
        return correlationId;
    }

    private boolean containsConstraint(Throwable throwable, String constraintName) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof org.hibernate.exception.ConstraintViolationException constraintViolation
                    && constraintName.equals(constraintViolation.getConstraintName())) {
                return true;
            }

            String message = current.getMessage();
            if (message != null && message.contains(constraintName)) {
                return true;
            }

            current = current.getCause();
        }
        return false;
    }
}
