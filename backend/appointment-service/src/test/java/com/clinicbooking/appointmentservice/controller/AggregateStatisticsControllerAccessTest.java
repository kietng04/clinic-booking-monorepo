package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.DoctorAnalyticsDashboardDto;
import com.clinicbooking.appointmentservice.service.AggregateStatisticsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AggregateStatisticsController.class)
@ActiveProfiles("test")
@DisplayName("AggregateStatisticsController Access Control Tests")
class AggregateStatisticsControllerAccessTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AggregateStatisticsService aggregateStatisticsService;

    @MockBean
    private com.clinicbooking.appointmentservice.repository.AppointmentRepository appointmentRepository;

    @Test
    @DisplayName("Should allow ADMIN to access doctor analytics for any doctor")
    void shouldAllowAdminToAccessAnyDoctorAnalytics() throws Exception {
        when(aggregateStatisticsService.getDoctorAnalyticsDashboard(99L)).thenReturn(mockDashboard());

        mockMvc.perform(get("/api/statistics/aggregate/analytics/doctor/{doctorId}/dashboard", 99L)
                        .header("X-User-Id", "1")
                        .header("X-User-Role", "ADMIN")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(aggregateStatisticsService).getDoctorAnalyticsDashboard(99L);
    }

    @Test
    @DisplayName("Should allow DOCTOR to access own analytics")
    void shouldAllowDoctorToAccessOwnAnalytics() throws Exception {
        when(aggregateStatisticsService.getDoctorAnalyticsDashboard(42L)).thenReturn(mockDashboard());

        mockMvc.perform(get("/api/statistics/aggregate/analytics/doctor/{doctorId}/dashboard", 42L)
                        .header("X-User-Id", "42")
                        .header("X-User-Role", "DOCTOR")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(aggregateStatisticsService).getDoctorAnalyticsDashboard(42L);
    }

    @Test
    @DisplayName("Should deny DOCTOR when accessing another doctor's analytics")
    void shouldDenyDoctorAccessingAnotherDoctorAnalytics() throws Exception {
        mockMvc.perform(get("/api/statistics/aggregate/analytics/doctor/{doctorId}/dashboard", 99L)
                        .header("X-User-Id", "42")
                        .header("X-User-Role", "DOCTOR")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        verify(aggregateStatisticsService, never()).getDoctorAnalyticsDashboard(anyLong());
    }

    @Test
    @DisplayName("Should deny non-admin non-doctor role")
    void shouldDenyNonAdminNonDoctorRole() throws Exception {
        mockMvc.perform(get("/api/statistics/aggregate/analytics/doctor/{doctorId}/dashboard", 42L)
                        .header("X-User-Id", "42")
                        .header("X-User-Role", "PATIENT")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        verify(aggregateStatisticsService, never()).getDoctorAnalyticsDashboard(anyLong());
    }

    @Test
    @DisplayName("Should deny when user headers are missing")
    void shouldDenyWhenHeadersMissing() throws Exception {
        mockMvc.perform(get("/api/statistics/aggregate/analytics/doctor/{doctorId}/dashboard", 42L)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        verify(aggregateStatisticsService, never()).getDoctorAnalyticsDashboard(anyLong());
    }

    @Test
    @DisplayName("Should deny when X-User-Id is malformed")
    void shouldDenyWhenUserIdMalformed() throws Exception {
        mockMvc.perform(get("/api/statistics/aggregate/analytics/doctor/{doctorId}/dashboard", 42L)
                        .header("X-User-Id", "abc")
                        .header("X-User-Role", "DOCTOR")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        verify(aggregateStatisticsService, never()).getDoctorAnalyticsDashboard(anyLong());
    }

    @Test
    @DisplayName("Should allow normalized ROLE_DOCTOR value for own analytics")
    void shouldAllowRoleDoctorPrefixAndCaseInsensitivity() throws Exception {
        when(aggregateStatisticsService.getDoctorAnalyticsDashboard(42L)).thenReturn(mockDashboard());

        mockMvc.perform(get("/api/statistics/aggregate/analytics/doctor/{doctorId}/dashboard", 42L)
                        .header("X-User-Id", "42")
                        .header("X-User-Role", "role_doctor")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(aggregateStatisticsService).getDoctorAnalyticsDashboard(42L);
    }

    private DoctorAnalyticsDashboardDto mockDashboard() {
        return DoctorAnalyticsDashboardDto.builder()
                .generatedAt(LocalDateTime.now())
                .build();
    }
}
