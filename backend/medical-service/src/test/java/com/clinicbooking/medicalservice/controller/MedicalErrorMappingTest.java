package com.clinicbooking.medicalservice.controller;

import com.clinicbooking.medicalservice.exception.AccessDeniedException;
import com.clinicbooking.medicalservice.exception.ApiErrorResponse;
import com.clinicbooking.medicalservice.exception.GlobalExceptionHandler;
import com.clinicbooking.medicalservice.exception.ResourceNotFoundException;
import com.clinicbooking.medicalservice.exception.ValidationException;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("Medical Error Mapping Tests")
class MedicalErrorMappingTest {

    private GlobalExceptionHandler handler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/medical-records/100");
        when(request.getHeader("X-Correlation-Id")).thenReturn("corr-medical-100");
    }

    @Test
    @DisplayName("Should map ValidationException to 400 contract")
    void shouldMapValidationExceptionToBadRequest() {
        ResponseEntity<ApiErrorResponse> response = handler.handleValidationException(
                new ValidationException("Dữ liệu bệnh án không hợp lệ"),
                request
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().status());
        assertEquals("Dữ liệu bệnh án không hợp lệ", response.getBody().message());
        assertEquals("VALIDATION_ERROR", response.getBody().errorCode());
        assertEquals("corr-medical-100", response.getBody().correlationId());
    }

    @Test
    @DisplayName("Should map AccessDeniedException to 403 contract")
    void shouldMapAccessDeniedExceptionToForbidden() {
        ResponseEntity<ApiErrorResponse> response = handler.handleAccessDeniedException(
                new AccessDeniedException("Không có quyền truy cập bệnh án này"),
                request
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(403, response.getBody().status());
        assertEquals("FORBIDDEN", response.getBody().errorCode());
        assertEquals("Không có quyền truy cập bệnh án này", response.getBody().message());
        assertEquals("/api/medical-records/100", response.getBody().path());
    }

    @Test
    @DisplayName("Should map ResourceNotFoundException to 404 contract")
    void shouldMapResourceNotFoundExceptionToNotFound() {
        ResponseEntity<ApiErrorResponse> response = handler.handleResourceNotFoundException(
                new ResourceNotFoundException("Không tìm thấy bệnh án"),
                request
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().status());
        assertEquals("RESOURCE_NOT_FOUND", response.getBody().errorCode());
        assertEquals("Không tìm thấy bệnh án", response.getBody().message());
    }

    @Test
    @DisplayName("Should map invalid request body with field details")
    void shouldMapMethodArgumentNotValidExceptionWithFieldDetails() {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "medicalRecord");
        bindingResult.addError(new FieldError("medicalRecord", "diagnosis", "Chẩn đoán là bắt buộc"));
        MethodArgumentNotValidException exception =
                new MethodArgumentNotValidException(mock(MethodParameter.class), bindingResult);

        when(request.getHeader("X-Correlation-Id")).thenReturn(null);
        when(request.getHeader("X-Correlation-ID")).thenReturn("corr-uppercase-101");

        ResponseEntity<ApiErrorResponse> response =
                handler.handleMethodArgumentNotValidException(exception, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("METHOD_ARGUMENT_NOT_VALID", response.getBody().errorCode());
        assertEquals("Chẩn đoán là bắt buộc", response.getBody().message());
        assertEquals("corr-uppercase-101", response.getBody().correlationId());
        assertEquals("Chẩn đoán là bắt buộc", response.getBody().details().get("diagnosis"));
    }

    @Test
    @DisplayName("Should map unexpected exceptions to 500 contract")
    void shouldMapGenericExceptionToInternalServerError() {
        ResponseEntity<ApiErrorResponse> response = handler.handleGenericException(
                new RuntimeException("boom"),
                request
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().status());
        assertEquals("INTERNAL_SERVER_ERROR", response.getBody().errorCode());
        assertEquals("An unexpected error occurred. Please try again later.", response.getBody().message());
        assertEquals("corr-medical-100", response.getBody().correlationId());
    }
}
