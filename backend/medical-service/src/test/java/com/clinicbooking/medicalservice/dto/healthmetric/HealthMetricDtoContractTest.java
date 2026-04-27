package com.clinicbooking.medicalservice.dto.healthmetric;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class HealthMetricDtoContractTest {

    @Test
    void createDtoSupportsBuilderAndMutators() {
        LocalDateTime measuredAt = LocalDateTime.of(2026, 4, 19, 8, 0);
        HealthMetricCreateDto dto = HealthMetricCreateDto.builder()
                .patientId(1L)
                .patientName("Patient A")
                .metricType("heart_rate")
                .value("80")
                .unit("bpm")
                .measuredAt(measuredAt)
                .notes("Morning")
                .build();

        HealthMetricCreateDto copy = new HealthMetricCreateDto();
        copy.setPatientId(1L);
        copy.setPatientName("Patient A");
        copy.setMetricType("heart_rate");
        copy.setValue("80");
        copy.setUnit("bpm");
        copy.setMeasuredAt(measuredAt);
        copy.setNotes("Morning");

        assertThat(copy).isEqualTo(dto);
        assertThat(dto.hashCode()).isEqualTo(copy.hashCode());
        assertThat(dto.toString()).contains("heart_rate", "Morning");
    }

    @Test
    void filterDtoAppliesBuilderDefaults() {
        HealthMetricFilterDto dto = HealthMetricFilterDto.builder()
                .patientId(5L)
                .metricType("blood_pressure")
                .minValue(70.0)
                .maxValue(180.0)
                .build();
        HealthMetricFilterDto copy = new HealthMetricFilterDto();
        copy.setPatientId(5L);
        copy.setMetricType("blood_pressure");
        copy.setMinValue(70.0);
        copy.setMaxValue(180.0);
        copy.setIsAbnormal(false);
        copy.setSortBy("measured_at");
        copy.setSortDirection("DESC");
        copy.setPage(0);
        copy.setPageSize(20);

        assertThat(dto.getIsAbnormal()).isFalse();
        assertThat(dto.getSortBy()).isEqualTo("measured_at");
        assertThat(dto.getSortDirection()).isEqualTo("DESC");
        assertThat(dto.getPage()).isZero();
        assertThat(dto.getPageSize()).isEqualTo(20);
        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("blood_pressure");
    }

    @Test
    void responseDtoSupportsAllArgsConstructorAndEquality() {
        LocalDateTime timestamp = LocalDateTime.of(2026, 4, 19, 9, 0);
        HealthMetricResponseDto dto = new HealthMetricResponseDto(
                1L, 2L, "Patient A", "temperature", "37.1", "C",
                timestamp, "Stable", timestamp, timestamp, false
        );
        HealthMetricResponseDto copy = HealthMetricResponseDto.builder()
                .id(1L)
                .patientId(2L)
                .patientName("Patient A")
                .metricType("temperature")
                .value("37.1")
                .unit("C")
                .measuredAt(timestamp)
                .notes("Stable")
                .createdAt(timestamp)
                .updatedAt(timestamp)
                .isAbnormal(false)
                .build();

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("temperature", "37.1");
    }

    @Test
    void updateDtoSupportsBuilderAndMutators() {
        LocalDateTime measuredAt = LocalDateTime.of(2026, 4, 19, 10, 0);
        HealthMetricUpdateDto dto = HealthMetricUpdateDto.builder()
                .metricType("weight")
                .value("70")
                .unit("kg")
                .measuredAt(measuredAt)
                .notes("After lunch")
                .build();

        HealthMetricUpdateDto copy = new HealthMetricUpdateDto();
        copy.setMetricType("weight");
        copy.setValue("70");
        copy.setUnit("kg");
        copy.setMeasuredAt(measuredAt);
        copy.setNotes("After lunch");

        assertThat(copy).isEqualTo(dto);
        assertThat(copy.hashCode()).isEqualTo(dto.hashCode());
        assertThat(dto.toString()).contains("weight", "70");
    }
}
