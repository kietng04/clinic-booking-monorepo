package com.clinicbooking.appointmentservice.dto;

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
public class PatientMedicalSummaryDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private Long totalMedicalRecords;
    private Long totalPrescriptions;
    private Long totalHealthMetrics;
    private LocalDateTime generatedAt;
    private Integer cacheDurationMinutes;
}
