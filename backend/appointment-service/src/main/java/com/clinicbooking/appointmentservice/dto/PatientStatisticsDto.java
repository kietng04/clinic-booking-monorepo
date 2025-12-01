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
@Schema(description = "Patient-specific Statistics")
public class PatientStatisticsDto implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "Patient ID", example = "123")
    private Long patientId;

    @Schema(description = "Total appointments for this patient", example = "25")
    private Long totalAppointments;

    @Schema(description = "Completed appointments", example = "20")
    private Long completedAppointments;

    @Schema(description = "Upcoming appointments", example = "3")
    private Long upcomingAppointments;

    @Schema(description = "Cancelled appointments", example = "2")
    private Long cancelledAppointments;

    @Schema(description = "Total medical records", example = "15")
    private Long totalMedicalRecords;

    @Schema(description = "Total prescriptions", example = "35")
    private Long totalPrescriptions;

    @Schema(description = "Total health metrics logged", example = "45")
    private Long healthMetricsLogged;

    @Schema(description = "Last appointment date", example = "2025-01-05")
    private String lastAppointmentDate;

    @Schema(description = "Most frequent doctor ID", example = "5")
    private Long frequentDoctorId;

    @Schema(description = "Appointment completion rate", example = "80.0")
    private Double completionRate;

    @Schema(description = "Average appointments per month", example = "2.5")
    private Double avgAppointmentsPerMonth;

    @Schema(description = "Timestamp when statistics were generated")
    private LocalDateTime generatedAt;

    @Schema(description = "Cache duration in minutes", example = "5")
    private Integer cacheDurationMinutes;
}
