package com.clinicbooking.appointmentservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Comprehensive Dashboard Statistics - Aggregated from all services")
public class AggregatedDashboardStatisticsDto implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "User Service Statistics")
    private UserStatisticsDto userStatistics;

    @Schema(description = "Appointment Service Statistics")
    private AppointmentStatisticsDto appointmentStatistics;

    @Schema(description = "Medical Service Statistics")
    private MedicalStatisticsDto medicalStatistics;

    @Schema(description = "Overall system health metrics")
    private SystemHealthDto systemHealth;

    @Schema(description = "Timestamp when dashboard was generated", example = "2025-01-08T10:30:00")
    private LocalDateTime generatedAt;

    @Schema(description = "Cache duration in minutes", example = "5")
    private Integer cacheDurationMinutes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "System Health Metrics")
    public static class SystemHealthDto implements Serializable {
        private static final long serialVersionUID = 1L;
        @Schema(description = "Total active users in system")
        private Long totalActiveUsers;

        @Schema(description = "Total appointment completion rate")
        private Double completionRate;

        @Schema(description = "Average daily appointments")
        private Double avgDailyAppointments;

        @Schema(description = "System utilization percentage")
        private Double utilizationRate;

        @Schema(description = "Doctor to patient ratio")
        private Double doctorPatientRatio;

        @Schema(description = "Number of critical actions needed")
        private Long pendingActionsCount;
    }
}
