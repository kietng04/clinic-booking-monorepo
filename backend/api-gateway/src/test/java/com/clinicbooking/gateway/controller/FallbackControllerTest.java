package com.clinicbooking.gateway.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@DisplayName("Fallback Controller Tests")
class FallbackControllerTest {

    private final FallbackController fallbackController = new FallbackController();

    @Test
    @DisplayName("Should return structured service unavailable response")
    void shouldReturnStructuredServiceUnavailableResponse() {
        ServerHttpRequest request = MockServerHttpRequest.get("/fallback")
                .header("X-Correlation-Id", "corr-fallback-500")
                .build();

        ResponseEntity<Map<String, Object>> response = fallbackController.fallback(request);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(503, response.getBody().get("status"));
        assertEquals("Service Unavailable", response.getBody().get("error"));
        assertEquals("SERVICE_UNAVAILABLE", response.getBody().get("errorCode"));
        assertEquals("corr-fallback-500", response.getBody().get("correlationId"));
        assertEquals("/fallback", response.getBody().get("path"));
    }
}
