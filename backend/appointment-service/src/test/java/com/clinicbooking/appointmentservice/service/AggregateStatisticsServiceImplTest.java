package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.client.MedicalServiceClient;
import com.clinicbooking.appointmentservice.client.UserServiceClient;
import com.clinicbooking.appointmentservice.dto.AdminAnalyticsDashboardDto;
import com.clinicbooking.appointmentservice.dto.UserDto;
import com.clinicbooking.appointmentservice.repository.AppointmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AggregateStatisticsServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private MedicalServiceClient medicalServiceClient;

    @InjectMocks
    private AggregateStatisticsServiceImpl aggregateStatisticsService;

    @Test
    void getAdminAnalyticsDashboardUsesAveragePatientRatingForTopDoctors() {
        when(appointmentRepository.getMonthlyRevenue(any())).thenReturn(List.of());
        when(userServiceClient.getUserGrowthByMonth(eq(12))).thenReturn(List.of());
        when(appointmentRepository.getAppointmentTrendsByMonth(any())).thenReturn(List.of());
        when(appointmentRepository.getStatusDistribution()).thenReturn(List.of());
        when(userServiceClient.getSpecializationDistribution()).thenReturn(List.of());
        when(appointmentRepository.getTopDoctorStats(any(Pageable.class))).thenReturn(List.of(
                Map.of(
                        "doctorId", 908L,
                        "doctorName", "BS. Hoang Thanh An",
                        "totalAppointments", 40L,
                        "totalRevenue", BigDecimal.valueOf(12_500_000L),
                        "avgRating", BigDecimal.valueOf(3.99),
                        "completedCount", 32L,
                        "totalCount", 40L
                )));
        when(appointmentRepository.getRecentAppointments(any(Pageable.class))).thenReturn(List.of());
        when(userServiceClient.getUserById(908L)).thenReturn(UserDto.builder()
                .id(908L)
                .fullName("BS. Hoang Thanh An")
                .specialization("Nội tổng quát")
                .build());

        AdminAnalyticsDashboardDto result = aggregateStatisticsService.getAdminAnalyticsDashboard();

        assertThat(result.getTopDoctors()).hasSize(1);
        assertThat(result.getTopDoctors().get(0).getRating()).isEqualTo(4.0);
        assertThat(result.getTopDoctors().get(0).getCompletionRate()).isEqualTo(80);
        assertThat(result.getTopDoctors().get(0).getSpecialization()).isEqualTo("Nội tổng quát");
    }
}
