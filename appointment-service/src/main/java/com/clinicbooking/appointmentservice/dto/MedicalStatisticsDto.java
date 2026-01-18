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
@Schema(description = "Medical Statistics - Aggregated from Medical Service")
public class MedicalStatisticsDto {
    @Schema(example = "450")
    private Long totalMedicalRecords;
    @Schema(example = "680")
    private Long totalPrescriptions;
    @Schema(example = "45")
    private Long medicalRecordsThisMonth;
    @Schema(example = "68")
    private Long prescriptionsThisMonth;
    @Schema(example = "250")
    private Long totalMedications;
    @Schema(example = "1200")
    private Long totalHealthMetrics;
    @Schema(example = "120")
    private Long healthMetricsThisMonth;
    @Schema(example = "1.51")
    private Double avgPrescriptionsPerRecord;
    @Schema(example = "35")
    private Long uniqueDoctorsCount;
    @Schema(example = "300")
    private Long uniquePatientsCount;
    private LocalDateTime generatedAt;
    private Integer cacheDurationMinutes;
}
