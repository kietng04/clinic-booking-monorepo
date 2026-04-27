package com.clinicbooking.medicalservice.controller;

import com.clinicbooking.medicalservice.dto.MedicalStatisticsDto;
import com.clinicbooking.medicalservice.dto.PatientMedicalSummaryDto;
import com.clinicbooking.medicalservice.service.MedicalStatisticsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MedicalStatisticsControllerTest {

    @Mock
    private MedicalStatisticsService medicalStatisticsService;

    @InjectMocks
    private MedicalStatisticsController medicalStatisticsController;

    @Test
    void getMedicalStatisticsReturnsSummary() {
        MedicalStatisticsDto dto = MedicalStatisticsDto.builder().totalMedicalRecords(15L).totalMedications(22L).build();
        when(medicalStatisticsService.getMedicalStatistics()).thenReturn(dto);

        ResponseEntity<MedicalStatisticsDto> response = medicalStatisticsController.getMedicalStatistics();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(dto);
    }

    @Test
    void getPatientMedicalSummaryReturnsSummary() {
        PatientMedicalSummaryDto dto = PatientMedicalSummaryDto.builder().patientId(12L).totalMedicalRecords(3L).build();
        when(medicalStatisticsService.getPatientMedicalSummary(12L)).thenReturn(dto);

        ResponseEntity<PatientMedicalSummaryDto> response = medicalStatisticsController.getPatientMedicalSummary(12L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(dto);
    }

    @Test
    void clearStatisticsCacheReturnsNoContent() {
        ResponseEntity<Void> response = medicalStatisticsController.clearStatisticsCache();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(medicalStatisticsService).clearStatisticsCache();
    }
}
