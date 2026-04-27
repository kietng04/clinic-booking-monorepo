package com.clinicbooking.medicalservice.controller;

import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricCreateDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricResponseDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricUpdateDto;
import com.clinicbooking.medicalservice.service.HealthMetricService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HealthMetricControllerTest {

    @Mock
    private HealthMetricService healthMetricService;

    @InjectMocks
    private HealthMetricController healthMetricController;

    @Test
    void createHealthMetricReturnsCreatedResponse() {
        HealthMetricCreateDto dto = new HealthMetricCreateDto();
        HealthMetricResponseDto responseDto = HealthMetricResponseDto.builder().id(1L).patientId(8L).metricType("HEART_RATE").build();
        when(healthMetricService.createHealthMetric(dto)).thenReturn(responseDto);

        ResponseEntity<HealthMetricResponseDto> response = healthMetricController.createHealthMetric(dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(responseDto);
    }

    @Test
    void getHealthMetricByIdReturnsOk() {
        HealthMetricResponseDto responseDto = HealthMetricResponseDto.builder().id(10L).patientId(8L).metricType("WEIGHT").build();
        when(healthMetricService.getHealthMetricById(10L)).thenReturn(responseDto);

        ResponseEntity<HealthMetricResponseDto> response = healthMetricController.getHealthMetricById(10L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(responseDto);
    }

    @Test
    void getHealthMetricsByPatientIdReturnsPagedResponse() {
        PageRequest pageable = PageRequest.of(0, 5);
        Page<HealthMetricResponseDto> page = new PageImpl<>(
                List.of(HealthMetricResponseDto.builder().id(3L).patientId(8L).metricType("HEIGHT").build()),
                pageable,
                1
        );
        when(healthMetricService.getHealthMetricsByPatientId(8L, pageable)).thenReturn(page);

        ResponseEntity<Page<HealthMetricResponseDto>> response =
                healthMetricController.getHealthMetricsByPatientId(8L, pageable);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
    }

    @Test
    void getHealthMetricsByPatientIdAndTypeReturnsOk() {
        List<HealthMetricResponseDto> responseDtos = List.of(
                HealthMetricResponseDto.builder().id(4L).patientId(8L).metricType("WEIGHT").build()
        );
        when(healthMetricService.getHealthMetricsByPatientIdAndType(8L, "WEIGHT")).thenReturn(responseDtos);

        ResponseEntity<List<HealthMetricResponseDto>> response =
                healthMetricController.getHealthMetricsByPatientIdAndType(8L, "WEIGHT");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactlyElementsOf(responseDtos);
    }

    @Test
    void getHealthMetricsByPatientIdAndDateRangeReturnsOk() {
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now();
        List<HealthMetricResponseDto> responseDtos = List.of(
                HealthMetricResponseDto.builder().id(2L).patientId(8L).metricType("WEIGHT").build()
        );
        when(healthMetricService.getHealthMetricsByPatientIdAndDateRange(8L, start, end)).thenReturn(responseDtos);

        ResponseEntity<List<HealthMetricResponseDto>> response =
                healthMetricController.getHealthMetricsByPatientIdAndDateRange(8L, start, end);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactlyElementsOf(responseDtos);
    }

    @Test
    void updateHealthMetricReturnsOk() {
        HealthMetricUpdateDto dto = HealthMetricUpdateDto.builder().value("72").build();
        HealthMetricResponseDto responseDto = HealthMetricResponseDto.builder().id(11L).value("72").build();
        when(healthMetricService.updateHealthMetric(11L, dto)).thenReturn(responseDto);

        ResponseEntity<HealthMetricResponseDto> response = healthMetricController.updateHealthMetric(11L, dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(responseDto);
    }

    @Test
    void deleteHealthMetricReturnsNoContent() {
        ResponseEntity<Void> response = healthMetricController.deleteHealthMetric(13L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(healthMetricService).deleteHealthMetric(13L);
    }
}
