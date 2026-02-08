package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.exception.ResourceNotFoundException;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AppointmentController.class)
@ActiveProfiles("test")
@DisplayName("Global Exception Handler Contract Tests")
class GlobalExceptionHandlerContractTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppointmentService appointmentService;

    @Test
    @DisplayName("Should include correlation id and error code for validation exceptions")
    void shouldIncludeCorrelationIdAndErrorCodeForValidationException() throws Exception {
        when(appointmentService.createAppointment(any()))
                .thenThrow(new ValidationException("Bác sĩ không làm việc vào ngày này"));

        mockMvc.perform(post("/api/appointments")
                        .header("X-Correlation-Id", "corr-validation-123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"patientId\":26,\"doctorId\":2,\"appointmentDate\":\"2099-02-10\",\"appointmentTime\":\"09:00\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Bác sĩ không làm việc vào ngày này"))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.path").value("/api/appointments"))
                .andExpect(jsonPath("$.correlationId").value("corr-validation-123"));
    }

    @Test
    @DisplayName("Should map ResourceNotFoundException to 404 with contract fields")
    void shouldMapResourceNotFoundExceptionToNotFound() throws Exception {
        when(appointmentService.getAppointmentById(999L))
                .thenThrow(new ResourceNotFoundException("Lịch hẹn không tồn tại"));

        mockMvc.perform(get("/api/appointments/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Lịch hẹn không tồn tại"))
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.path").value("/api/appointments/999"))
                .andExpect(jsonPath("$.correlationId").isNotEmpty());
    }

    @Test
    @DisplayName("Should map ResponseStatusException to 403 with reason message")
    void shouldMapResponseStatusExceptionToForbidden() throws Exception {
        mockMvc.perform(put("/api/appointments/12/feedback")
                        .header("X-Correlation-Id", "corr-forbidden-403")
                        .header("X-User-Id", "31")
                        .header("X-User-Role", "DOCTOR")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":5}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Only patients can submit feedback"))
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"))
                .andExpect(jsonPath("$.path").value("/api/appointments/12/feedback"))
                .andExpect(jsonPath("$.correlationId").value("corr-forbidden-403"));
    }
}
