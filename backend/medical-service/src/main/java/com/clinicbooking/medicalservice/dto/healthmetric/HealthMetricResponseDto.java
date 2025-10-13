package com.clinicbooking.medicalservice.dto.healthmetric;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthMetricResponseDto {

    private Long id;
    private Long patientId;
    private String patientName;
    private String metricType;
    private String value;
    private String unit;
    private LocalDateTime measuredAt;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isAbnormal;
}
