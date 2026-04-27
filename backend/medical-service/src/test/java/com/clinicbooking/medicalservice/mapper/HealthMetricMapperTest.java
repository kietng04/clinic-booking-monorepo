package com.clinicbooking.medicalservice.mapper;

import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricCreateDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricResponseDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricUpdateDto;
import com.clinicbooking.medicalservice.entity.HealthMetric;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class HealthMetricMapperTest {

    private final HealthMetricMapper mapper = Mappers.getMapper(HealthMetricMapper.class);

    @Test
    void toEntityMapsCreateDtoAndIgnoresManagedFields() {
        HealthMetricCreateDto dto = HealthMetricCreateDto.builder()
                .patientId(100L)
                .patientName("Ignored")
                .metricType("temperature")
                .value("37.2")
                .unit("C")
                .measuredAt(LocalDateTime.of(2026, 4, 19, 8, 0))
                .notes("Stable")
                .build();

        HealthMetric entity = mapper.toEntity(dto);

        assertThat(entity.getId()).isNull();
        assertThat(entity.getPatientId()).isEqualTo(100L);
        assertThat(entity.getPatientName()).isNull();
        assertThat(entity.getMetricType()).isEqualTo("temperature");
    }

    @Test
    void toDtoIncludesComputedAbnormalFlag() {
        HealthMetric entity = HealthMetric.builder()
                .id(1L)
                .patientId(100L)
                .patientName("Patient One")
                .metricType("heart_rate")
                .value("120")
                .measuredAt(LocalDateTime.of(2026, 4, 19, 8, 0))
                .build();

        HealthMetricResponseDto dto = mapper.toDto(entity);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getIsAbnormal()).isTrue();
    }

    @Test
    void updateEntityFromDtoOnlyOverwritesNonNullFields() {
        HealthMetric entity = HealthMetric.builder()
                .patientId(100L)
                .patientName("Patient One")
                .metricType("heart_rate")
                .value("80")
                .unit("bpm")
                .notes("Before")
                .build();
        HealthMetricUpdateDto dto = HealthMetricUpdateDto.builder()
                .value("90")
                .notes("After")
                .build();

        mapper.updateEntityFromDto(dto, entity);

        assertThat(entity.getPatientId()).isEqualTo(100L);
        assertThat(entity.getMetricType()).isEqualTo("heart_rate");
        assertThat(entity.getValue()).isEqualTo("90");
        assertThat(entity.getNotes()).isEqualTo("After");
        assertThat(entity.getUnit()).isEqualTo("bpm");
    }
}
