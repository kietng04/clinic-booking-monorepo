package com.clinicbooking.clinic_booking_system.dto.healthmetric;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthMetricCreateDto {
    @NotNull
    private Long familyMemberId;
    @NotNull
    private String metricType;
    @NotNull
    private String value;
    private String unit;
    private LocalDateTime measuredAt;
}
