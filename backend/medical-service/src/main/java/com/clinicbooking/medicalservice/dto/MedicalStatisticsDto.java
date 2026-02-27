package com.clinicbooking.medicalservice.dto;

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
@Schema(description = "Medical Statistics Summary")
public class MedicalStatisticsDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "Total number of medical records", example = "450")
    private Long totalMedicalRecords;

    @Schema(description = "Total number of prescriptions", example = "680")
    private Long totalPrescriptions;

    @Schema(description = "Medical records created this month", example = "45")
    private Long medicalRecordsThisMonth;

    @Schema(description = "Prescriptions created this month", example = "68")
    private Long prescriptionsThisMonth;

    @Schema(description = "Total number of medications", example = "250")
    private Long totalMedications;

    @Schema(description = "Total number of health metrics recorded", example = "1200")
    private Long totalHealthMetrics;

    @Schema(description = "Health metrics recorded this month", example = "120")
    private Long healthMetricsThisMonth;

    @Schema(description = "Average prescriptions per medical record", example = "1.51")
    private Double avgPrescriptionsPerRecord;

    @Schema(description = "Unique doctors with medical records", example = "35")
    private Long uniqueDoctorsCount;

    @Schema(description = "Unique patients with medical records", example = "300")
    private Long uniquePatientsCount;

    @Schema(description = "Timestamp when statistics were generated", example = "2025-01-08T10:30:00")
    private LocalDateTime generatedAt;

    @Schema(description = "Cache duration in minutes", example = "5")
    private Integer cacheDurationMinutes;
}
