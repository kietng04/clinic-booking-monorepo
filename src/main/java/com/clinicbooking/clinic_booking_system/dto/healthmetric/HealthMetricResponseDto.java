package com.clinicbooking.clinic_booking_system.dto.healthmetric;

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
    private Long familyMemberId;
    private String familyMemberName;
    private String metricType;
    private String value;
    private String unit;
    private LocalDateTime measuredAt;
    private String notes;
    private LocalDateTime createdAt;
}
