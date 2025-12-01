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
@Schema(description = "Patient-specific medical summary")
public class PatientMedicalSummaryDto implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "Patient ID", example = "953")
    private Long patientId;

    @Schema(description = "Total medical records for the patient", example = "12")
    private Long totalMedicalRecords;

    @Schema(description = "Total prescriptions for the patient", example = "18")
    private Long totalPrescriptions;

    @Schema(description = "Total health metrics logged by the patient", example = "45")
    private Long totalHealthMetrics;

    @Schema(description = "Timestamp when summary was generated")
    private LocalDateTime generatedAt;

    @Schema(description = "Cache duration in minutes", example = "5")
    private Integer cacheDurationMinutes;
}
