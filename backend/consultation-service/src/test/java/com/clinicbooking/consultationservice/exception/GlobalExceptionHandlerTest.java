package com.clinicbooking.consultationservice.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("Consultation GlobalExceptionHandler Tests")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/consultations/999");
        when(request.getHeader("X-Correlation-Id")).thenReturn("corr-consult-123");
    }

    @Test
    @DisplayName("Should return standardized 404 response for ResourceNotFoundException")
    void shouldReturnNotFoundContract() {
        ResponseEntity<ApiErrorResponse> response = handler.handleResourceNotFoundException(
                new ResourceNotFoundException("Consultation not found"),
                request
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().status());
        assertEquals("Consultation not found", response.getBody().message());
        assertEquals("RESOURCE_NOT_FOUND", response.getBody().errorCode());
        assertEquals("/api/consultations/999", response.getBody().path());
        assertEquals("corr-consult-123", response.getBody().correlationId());
    }

    @Test
    @DisplayName("Should return standardized 400 response for IllegalArgumentException")
    void shouldReturnBadRequestContract() {
        ResponseEntity<ApiErrorResponse> response = handler.handleIllegalArgumentException(
                new IllegalArgumentException("Invalid consultation payload"),
                request
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().status());
        assertEquals("Invalid consultation payload", response.getBody().message());
        assertEquals("VALIDATION_ERROR", response.getBody().errorCode());
        assertEquals("corr-consult-123", response.getBody().correlationId());
    }

    @Test
    @DisplayName("Should return standardized 500 response for unexpected exceptions")
    void shouldReturnInternalServerErrorContract() {
        ResponseEntity<ApiErrorResponse> response = handler.handleGenericException(
                new RuntimeException("boom"),
                request
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().status());
        assertEquals("INTERNAL_SERVER_ERROR", response.getBody().errorCode());
        assertEquals("An unexpected error occurred. Please try again later.", response.getBody().message());
        assertEquals("corr-consult-123", response.getBody().correlationId());
    }
}
