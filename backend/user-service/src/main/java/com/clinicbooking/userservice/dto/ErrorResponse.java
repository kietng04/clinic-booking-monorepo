package com.clinicbooking.userservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Standard API error response DTO
 * Contains error information to be sent to clients
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    /**
     * Timestamp of when the error occurred (ISO 8601 format)
     */
    private String timestamp;

    /**
     * HTTP status code
     */
    private int status;

    /**
     * HTTP status reason phrase (e.g., "Not Found", "Bad Request")
     */
    private String error;

    /**
     * Human-readable error message
     */
    private String message;

    /**
     * The request path that caused the error
     */
    private String path;

    /**
     * Optional error code for client error handling
     */
    private String errorCode;

    /**
     * Optional additional details about the error (e.g., field validation errors)
     */
    private Map<String, Object> details;

    /**
     * Optional correlation ID for tracking errors across services
     */
    private String correlationId;

    /**
     * Add a detail to the error response
     *
     * @param key the detail key
     * @param value the detail value
     */
    public void addDetail(String key, Object value) {
        if (this.details == null) {
            this.details = new HashMap<>();
        }
        this.details.put(key, value);
    }

    /**
     * Builder to create ErrorResponse with current timestamp
     */
    public static class ErrorResponseBuilder {
        /**
         * Set timestamp to current time in ISO 8601 format
         *
         * @return this builder
         */
        public ErrorResponseBuilder withCurrentTimestamp() {
            this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            return this;
        }
    }
}
