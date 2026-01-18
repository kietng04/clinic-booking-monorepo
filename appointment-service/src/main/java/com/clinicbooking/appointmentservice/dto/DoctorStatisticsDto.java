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
@Schema(description = "Doctor-specific Statistics")
public class DoctorStatisticsDto {

    @Schema(description = "Doctor ID", example = "456")
    private Long doctorId;

    @Schema(description = "Total appointments handled", example = "150")
    private Long totalAppointments;

    @Schema(description = "Completed appointments", example = "145")
    private Long completedAppointments;

    @Schema(description = "Pending appointments", example = "3")
    private Long pendingAppointments;

    @Schema(description = "Cancelled appointments", example = "2")
    private Long cancelledAppointments;

    @Schema(description = "Total unique patients", example = "80")
    private Long uniquePatients;

    @Schema(description = "Total medical records created", example = "145")
    private Long totalMedicalRecords;

    @Schema(description = "Total prescriptions issued", example = "220")
    private Long totalPrescriptions;

    @Schema(description = "Average appointments per week", example = "12.5")
    private Double avgAppointmentsPerWeek;

    @Schema(description = "Appointment completion rate", example = "96.67")
    private Double completionRate;

    @Schema(description = "Average time per appointment (minutes)", example = "30")
    private Double avgAppointmentDuration;

    @Schema(description = "Last appointment date", example = "2025-01-08")
    private String lastAppointmentDate;

    @Schema(description = "Appointments this month", example = "45")
    private Long appointmentsThisMonth;

    @Schema(description = "Timestamp when statistics were generated")
    private LocalDateTime generatedAt;

    @Schema(description = "Cache duration in minutes", example = "5")
    private Integer cacheDurationMinutes;
}
