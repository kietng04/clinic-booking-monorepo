package com.clinicbooking.appointmentservice.client;

import com.clinicbooking.appointmentservice.dto.MedicalStatisticsDto;
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
}
