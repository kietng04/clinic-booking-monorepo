package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.dto.MedicalStatisticsDto;
import com.clinicbooking.medicalservice.dto.PatientMedicalSummaryDto;
import com.clinicbooking.medicalservice.repository.HealthMetricRepository;
import com.clinicbooking.medicalservice.repository.MedicalRecordRepository;
import com.clinicbooking.medicalservice.repository.MedicationRepository;
import com.clinicbooking.medicalservice.repository.PrescriptionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MedicalStatisticsServiceImplTest {

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private MedicationRepository medicationRepository;

    @Mock
    private HealthMetricRepository healthMetricRepository;

    @InjectMocks
    private MedicalStatisticsServiceImpl medicalStatisticsService;

    @Test
    void getMedicalStatisticsReturnsAggregatedSummary() {
        when(medicalRecordRepository.count()).thenReturn(8L);
        when(prescriptionRepository.count()).thenReturn(11L);
        when(medicationRepository.count()).thenReturn(6L);
        when(healthMetricRepository.count()).thenReturn(20L);
        when(medicalRecordRepository.countRecordsThisMonth()).thenReturn(3L);
        when(prescriptionRepository.countPrescriptionsThisMonth()).thenReturn(4L);
        when(healthMetricRepository.countMetricsThisMonth()).thenReturn(7L);
        when(medicalRecordRepository.countUniqueDoctors()).thenReturn(2L);
        when(medicalRecordRepository.countUniquePatients()).thenReturn(5L);

        MedicalStatisticsDto result = medicalStatisticsService.getMedicalStatistics();

        assertThat(result.getTotalMedicalRecords()).isEqualTo(8L);
        assertThat(result.getTotalPrescriptions()).isEqualTo(11L);
        assertThat(result.getAvgPrescriptionsPerRecord()).isEqualTo(1.38);
        assertThat(result.getCacheDurationMinutes()).isEqualTo(5);
        assertThat(result.getGeneratedAt()).isNotNull();
    }

    @Test
    void getMedicalStatisticsWrapsUnexpectedFailures() {
        when(medicalRecordRepository.count()).thenThrow(new IllegalStateException("db down"));

        assertThatThrownBy(() -> medicalStatisticsService.getMedicalStatistics())
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to fetch medical statistics")
                .hasCauseInstanceOf(IllegalStateException.class);
    }

    @Test
    void getPatientMedicalSummaryReturnsPatientScopedCounts() {
        when(medicalRecordRepository.countByPatientId(15L)).thenReturn(4L);
        when(prescriptionRepository.countByPatientId(15L)).thenReturn(9L);
        when(healthMetricRepository.countByPatientId(15L)).thenReturn(12L);

        PatientMedicalSummaryDto result = medicalStatisticsService.getPatientMedicalSummary(15L);

        assertThat(result.getPatientId()).isEqualTo(15L);
        assertThat(result.getTotalMedicalRecords()).isEqualTo(4L);
        assertThat(result.getTotalPrescriptions()).isEqualTo(9L);
        assertThat(result.getTotalHealthMetrics()).isEqualTo(12L);
        assertThat(result.getCacheDurationMinutes()).isEqualTo(5);
    }

    @Test
    void getPatientMedicalSummaryWrapsUnexpectedFailures() {
        when(medicalRecordRepository.countByPatientId(99L)).thenThrow(new IllegalArgumentException("bad state"));

        assertThatThrownBy(() -> medicalStatisticsService.getPatientMedicalSummary(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to fetch patient medical summary")
                .hasCauseInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void clearStatisticsCacheCompletesWithoutThrowing() {
        medicalStatisticsService.clearStatisticsCache();
    }
}
