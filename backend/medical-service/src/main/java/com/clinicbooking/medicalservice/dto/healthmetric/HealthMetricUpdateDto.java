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
public class HealthMetricUpdateDto {

    private String metricType;

    private String value;

    private String unit;

    private LocalDateTime measuredAt;

    private String notes;
}
