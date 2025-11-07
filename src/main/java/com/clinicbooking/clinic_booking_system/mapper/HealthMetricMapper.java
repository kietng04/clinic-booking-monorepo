package com.clinicbooking.clinic_booking_system.mapper;

import com.clinicbooking.clinic_booking_system.dto.healthmetric.HealthMetricCreateDto;
import com.clinicbooking.clinic_booking_system.dto.healthmetric.HealthMetricResponseDto;
import com.clinicbooking.clinic_booking_system.dto.healthmetric.HealthMetricUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.HealthMetric;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class HealthMetricMapper {

    public HealthMetric toEntity(HealthMetricCreateDto dto) {
        return HealthMetric.builder()
                .metricType(dto.getMetricType())
                .value(dto.getValue())
                .unit(dto.getUnit())
                .measuredAt(dto.getMeasuredAt() != null ? dto.getMeasuredAt() : LocalDateTime.now())
                .build();
    }

    public void updateEntity(HealthMetric metric, HealthMetricUpdateDto dto) {
        if (dto.getValue() != null) metric.setValue(dto.getValue());
        if (dto.getUnit() != null) metric.setUnit(dto.getUnit());
        if (dto.getMeasuredAt() != null) metric.setMeasuredAt(dto.getMeasuredAt());
        if (dto.getNotes() != null) metric.setNotes(dto.getNotes());
    }

    public HealthMetricResponseDto toResponseDto(HealthMetric metric) {
        return HealthMetricResponseDto.builder()
                .id(metric.getId())
                .familyMemberId(metric.getFamilyMember().getId())
                .familyMemberName(metric.getFamilyMember().getFullName())
                .metricType(metric.getMetricType())
                .value(metric.getValue())
                .unit(metric.getUnit())
                .measuredAt(metric.getMeasuredAt())
                .notes(metric.getNotes())
                .createdAt(metric.getCreatedAt())
                .build();
    }

    public List<HealthMetricResponseDto> toResponseDtoList(List<HealthMetric> metrics) {
        return metrics.stream().map(this::toResponseDto).collect(Collectors.toList());
    }
}
