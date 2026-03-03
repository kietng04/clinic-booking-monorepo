package com.clinicbooking.chatbotservice.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiErrorResponse(
        String timestamp,
        int status,
        String error,
        String message,
        String path,
        String errorCode,
        String correlationId,
        Map<String, Object> details
) {
}
