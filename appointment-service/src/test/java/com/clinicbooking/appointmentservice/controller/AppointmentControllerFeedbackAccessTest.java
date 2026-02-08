package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.AppointmentResponseDto;
import com.clinicbooking.appointmentservice.exception.ValidationException;
import com.clinicbooking.appointmentservice.service.AppointmentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AppointmentController.class)
@ActiveProfiles("test")
@DisplayName("AppointmentController Feedback Access Tests")
class AppointmentControllerFeedbackAccessTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppointmentService appointmentService;

    @Test
    @DisplayName("Should allow PATIENT to submit feedback")
    void shouldAllowPatientSubmitFeedback() throws Exception {
        when(appointmentService.submitFeedback(eq(11L), eq(101L), any()))
                .thenReturn(AppointmentResponseDto.builder()
                        .id(11L)
                        .patientRating(BigDecimal.valueOf(5.0))
                        .build());

        mockMvc.perform(put("/api/appointments/{id}/feedback", 11L)
                        .header("X-User-Id", "101")
                        .header("X-User-Role", "PATIENT")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":5,\"review\":\"Tot\"}"))
                .andExpect(status().isOk());

        verify(appointmentService).submitFeedback(eq(11L), eq(101L), any());
    }

    @Test
    @DisplayName("Should deny non-patient role")
    void shouldDenyNonPatientRole() throws Exception {
        mockMvc.perform(put("/api/appointments/{id}/feedback", 11L)
                        .header("X-User-Id", "101")
                        .header("X-User-Role", "DOCTOR")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":5,\"review\":\"Tot\"}"))
                .andExpect(status().isForbidden());

        verify(appointmentService, never()).submitFeedback(anyLong(), anyLong(), any());
    }

    @Test
    @DisplayName("Should deny when headers are missing")
    void shouldDenyWhenHeadersMissing() throws Exception {
        mockMvc.perform(put("/api/appointments/{id}/feedback", 11L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":5,\"review\":\"Tot\"}"))
                .andExpect(status().isForbidden());

        verify(appointmentService, never()).submitFeedback(anyLong(), anyLong(), any());
    }

    @Test
    @DisplayName("Should deny when X-User-Id is malformed")
    void shouldDenyMalformedUserId() throws Exception {
        mockMvc.perform(put("/api/appointments/{id}/feedback", 11L)
                        .header("X-User-Id", "abc")
                        .header("X-User-Role", "PATIENT")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":5,\"review\":\"Tot\"}"))
                .andExpect(status().isForbidden());

        verify(appointmentService, never()).submitFeedback(anyLong(), anyLong(), any());
    }

    @Test
    @DisplayName("Should return 400 when feedback business validation fails")
    void shouldReturnBadRequestWhenValidationFails() throws Exception {
        when(appointmentService.submitFeedback(eq(11L), eq(101L), any()))
                .thenThrow(new ValidationException("Lịch hẹn này đã được đánh giá"));

        mockMvc.perform(put("/api/appointments/{id}/feedback", 11L)
                        .header("X-User-Id", "101")
                        .header("X-User-Role", "PATIENT")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":5,\"review\":\"Tot\"}"))
                .andExpect(status().isBadRequest());
    }
}
