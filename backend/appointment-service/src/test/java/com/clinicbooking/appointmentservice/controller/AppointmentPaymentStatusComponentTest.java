package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.AppointmentResponseDto;
import com.clinicbooking.appointmentservice.service.AppointmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@DisplayName("Appointment Payment Status Component Tests")
class AppointmentPaymentStatusComponentTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    @Test
    @DisplayName("Should update payment status through appointment endpoint")
    void shouldUpdatePaymentStatusThroughAppointmentEndpoint() throws Exception {
        AppointmentResponseDto response = new AppointmentResponseDto();
        response.setId(1L);
        response.setStatus("CANCELLED");
        response.setPaymentStatus("PAYMENT_EXPIRED");

        when(appointmentService.updatePaymentStatus(eq(1L), any())).thenReturn(response);

        mockMvc.perform(patch("/api/appointments/1/payment-status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of(
                                        "paymentStatus", "PAYMENT_EXPIRED",
                                        "paymentMethod", "MOMO_WALLET"
                                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.paymentStatus").value("PAYMENT_EXPIRED"));
    }
}
