package com.clinicbooking.appointmentservice.controller;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AppointmentController.class)
@ActiveProfiles("test")
@DisplayName("AppointmentController Error Mapping Tests")
class AppointmentControllerErrorMappingTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppointmentService appointmentService;

    @Test
    @DisplayName("Should return 400 when create appointment fails business validation")
    void shouldReturnBadRequestWhenCreateAppointmentValidationFails() throws Exception {
        when(appointmentService.createAppointment(any()))
                .thenThrow(new ValidationException("Bác sĩ không làm việc vào ngày này"));

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"patientId\":26,\"doctorId\":2,\"appointmentDate\":\"2099-02-10\",\"appointmentTime\":\"09:00\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Bác sĩ không làm việc vào ngày này"))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.path").value("/api/appointments"));
    }
}
