package com.clinicbooking.gateway.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@Slf4j
public class FallbackController {

    @RequestMapping(value = "/fallback", method = {
            org.springframework.web.bind.annotation.RequestMethod.GET,
            org.springframework.web.bind.annotation.RequestMethod.POST,
            org.springframework.web.bind.annotation.RequestMethod.PUT,
            org.springframework.web.bind.annotation.RequestMethod.DELETE,
            org.springframework.web.bind.annotation.RequestMethod.PATCH
    })
    public ResponseEntity<Map<String, Object>> fallback(ServerHttpRequest request) {
        log.error("Circuit breaker triggered - service unavailable");

        String correlationId = request.getHeaders().getFirst("X-Correlation-Id");
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", OffsetDateTime.now().toString());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Service Unavailable");
        response.put("message", "The service is temporarily unavailable. Please try again later.");
        response.put("path", request.getURI().getPath());
        response.put("errorCode", "SERVICE_UNAVAILABLE");
        response.put("correlationId", correlationId);

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(response);
    }
}
