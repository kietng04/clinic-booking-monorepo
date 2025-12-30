package com.clinicbooking.medicalservice.mapper;

import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricCreateDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricResponseDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricUpdateDto;
import com.clinicbooking.medicalservice.entity.HealthMetric;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface HealthMetricMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patientName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    HealthMetric toEntity(HealthMetricCreateDto dto);

    @Mapping(target = "isAbnormal", expression = "java(entity.isAbnormal())")
    HealthMetricResponseDto toDto(HealthMetric entity);

    List<HealthMetricResponseDto> toDtoList(List<HealthMetric> entities);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patientId", ignore = true)
    @Mapping(target = "patientName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(HealthMetricUpdateDto dto, @MappingTarget HealthMetric entity);
}
