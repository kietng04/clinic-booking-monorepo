package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.dto.MedicalStatisticsDto;
import com.clinicbooking.medicalservice.repository.HealthMetricRepository;
import com.clinicbooking.medicalservice.repository.MedicalRecordRepository;
import com.clinicbooking.medicalservice.repository.MedicationRepository;
import com.clinicbooking.medicalservice.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MedicalStatisticsServiceImpl implements MedicalStatisticsService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicationRepository medicationRepository;
    private final HealthMetricRepository healthMetricRepository;

    private static final int CACHE_DURATION_MINUTES = 5;

    @Override
    @Cacheable(value = "medicalStatistics", unless = "#result == null")
    public MedicalStatisticsDto getMedicalStatistics() {
        log.info("Fetching medical statistics from database");

        try {
            // Get total counts
            long totalMedicalRecords = medicalRecordRepository.count();
            long totalPrescriptions = prescriptionRepository.count();
            long totalMedications = medicationRepository.count();
            long totalHealthMetrics = healthMetricRepository.count();

            // Get this month statistics
            long medicalRecordsThisMonth = medicalRecordRepository.countRecordsThisMonth();
            long prescriptionsThisMonth = prescriptionRepository.countPrescriptionsThisMonth();
            long healthMetricsThisMonth = healthMetricRepository.countMetricsThisMonth();

            // Calculate averages
            double avgPrescriptionsPerRecord = totalMedicalRecords > 0 ?
                    (totalPrescriptions * 1.0) / totalMedicalRecords : 0.0;

            // Get unique counts
            long uniqueDoctorsCount = medicalRecordRepository.countUniqueDoctors();
            long uniquePatientsCount = medicalRecordRepository.countUniquePatients();

            return MedicalStatisticsDto.builder()
                    .totalMedicalRecords(totalMedicalRecords)
                    .totalPrescriptions(totalPrescriptions)
                    .medicalRecordsThisMonth(medicalRecordsThisMonth)
                    .prescriptionsThisMonth(prescriptionsThisMonth)
                    .totalMedications(totalMedications)
                    .totalHealthMetrics(totalHealthMetrics)
                    .healthMetricsThisMonth(healthMetricsThisMonth)
                    .avgPrescriptionsPerRecord(Math.round(avgPrescriptionsPerRecord * 100.0) / 100.0)
                    .uniqueDoctorsCount(uniqueDoctorsCount)
                    .uniquePatientsCount(uniquePatientsCount)
                    .generatedAt(LocalDateTime.now())
                    .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching medical statistics", e);
            throw new RuntimeException("Failed to fetch medical statistics", e);
        }
    }

    @Override
    @CacheEvict(value = "medicalStatistics", allEntries = true)
    public void clearStatisticsCache() {
        log.info("Cleared medical statistics cache");
    }
}
