package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricCreateDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricResponseDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface HealthMetricService {

    HealthMetricResponseDto createHealthMetric(HealthMetricCreateDto dto);

    HealthMetricResponseDto getHealthMetricById(Long id);

    Page<HealthMetricResponseDto> getHealthMetricsByPatientId(Long patientId, Pageable pageable);

    List<HealthMetricResponseDto> getHealthMetricsByPatientIdAndType(Long patientId, String metricType);

    List<HealthMetricResponseDto> getHealthMetricsByPatientIdAndDateRange(
            Long patientId, LocalDateTime start, LocalDateTime end);

    HealthMetricResponseDto updateHealthMetric(Long id, HealthMetricUpdateDto dto);

    void deleteHealthMetric(Long id);
}
