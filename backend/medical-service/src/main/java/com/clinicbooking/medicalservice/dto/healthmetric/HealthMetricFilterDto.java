package com.clinicbooking.medicalservice.dto.healthmetric;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for filtering health metrics
 * Supports advanced filtering by various criteria
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthMetricFilterDto {

    /**
     * Patient ID (required for filtering)
     */
    private Long patientId;

    /**
     * Metric type to filter by (e.g., BLOOD_PRESSURE, HEART_RATE)
     */
    private String metricType;

    /**
     * Start date for filtering metrics
     */
    private LocalDateTime startDate;

    /**
     * End date for filtering metrics
     */
    private LocalDateTime endDate;

    /**
     * Minimum value for numeric metrics
     */
    private Double minValue;

    /**
     * Maximum value for numeric metrics
     */
    private Double maxValue;

    /**
     * Filter only abnormal metrics
     */
    @Builder.Default
    private Boolean isAbnormal = false;

    /**
     * Sort field (default: measured_at)
     * Options: measured_at, created_at, value, metricType
     */
    @Builder.Default
    private String sortBy = "measured_at";

    /**
     * Sort direction (ASC or DESC)
     */
    @Builder.Default
    private String sortDirection = "DESC";

    /**
     * Page number (0-indexed)
     */
    @Builder.Default
    private Integer page = 0;

    /**
     * Page size
     */
    @Builder.Default
    private Integer pageSize = 20;
}
