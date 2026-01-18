package com.clinicbooking.appointmentservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Appointment Statistics Summary")
public class AppointmentStatisticsDto {

    @Schema(description = "Total number of appointments", example = "500")
    private Long totalAppointments;

    @Schema(description = "Number of pending appointments", example = "120")
    private Long pendingAppointments;

    @Schema(description = "Number of confirmed appointments", example = "250")
    private Long confirmedAppointments;

    @Schema(description = "Number of completed appointments", example = "100")
    private Long completedAppointments;

    @Schema(description = "Number of cancelled appointments", example = "30")
    private Long cancelledAppointments;

    @Schema(description = "Appointments scheduled for today", example = "15")
    private Long appointmentsToday;

    @Schema(description = "Appointments scheduled for this week", example = "85")
    private Long appointmentsThisWeek;

    @Schema(description = "Appointments scheduled for this month", example = "350")
    private Long appointmentsThisMonth;

    @Schema(description = "In-person appointments count", example = "300")
    private Long inPersonAppointments;

    @Schema(description = "Online appointments count", example = "200")
    private Long onlineAppointments;

    @Schema(description = "Urgent priority appointments", example = "50")
    private Long urgentAppointments;

    @Schema(description = "Normal priority appointments", example = "450")
    private Long normalAppointments;

    @Schema(description = "Upcoming appointments (future + pending/confirmed)", example = "200")
    private Long upcomingAppointments;

    @Schema(description = "Completion rate percentage", example = "20.0")
    private Double completionRate;

    @Schema(description = "Cancellation rate percentage", example = "6.0")
    private Double cancellationRate;

    @Schema(description = "Average appointments per day this month", example = "11.67")
    private Double avgAppointmentsPerDay;

    @Schema(description = "Timestamp when statistics were generated", example = "2025-01-08T10:30:00")
    private LocalDateTime generatedAt;

    @Schema(description = "Cache duration in minutes", example = "5")
    private Integer cacheDurationMinutes;
}
