package com.clinicbooking.appointmentservice.client;

import com.clinicbooking.appointmentservice.dto.MedicalStatisticsDto;
import com.clinicbooking.appointmentservice.dto.PatientMedicalSummaryDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Slf4j
public class MedicalServiceClientFallback implements MedicalServiceClient {

    @Override
    public MedicalStatisticsDto getMedicalStatistics() {
        log.warn("Fallback: Medical service is unavailable. Returning empty medical statistics");
        return MedicalStatisticsDto.builder()
                .totalMedicalRecords(0L)
                .totalPrescriptions(0L)
                .medicalRecordsThisMonth(0L)
                .prescriptionsThisMonth(0L)
                .totalMedications(0L)
                .totalHealthMetrics(0L)
                .healthMetricsThisMonth(0L)
                .avgPrescriptionsPerRecord(0.0)
                .uniqueDoctorsCount(0L)
                .uniquePatientsCount(0L)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    @Override
    public PatientMedicalSummaryDto getPatientMedicalSummary(Long patientId) {
        log.warn("Fallback: Medical service unavailable for patient summary. Returning empty data for patientId={}", patientId);
        return PatientMedicalSummaryDto.builder()
                .patientId(patientId)
                .totalMedicalRecords(0L)
                .totalPrescriptions(0L)
                .totalHealthMetrics(0L)
                .generatedAt(LocalDateTime.now())
                .cacheDurationMinutes(10)
                .build();
    }
}
