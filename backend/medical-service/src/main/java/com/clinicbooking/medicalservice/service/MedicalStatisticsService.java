package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.dto.MedicalStatisticsDto;
import com.clinicbooking.medicalservice.dto.PatientMedicalSummaryDto;

public interface MedicalStatisticsService {
    /**
     * Get medical statistics summary
     * Includes medical records, prescriptions, medications, and health metrics statistics
     * Results are cached for 5 minutes
     *
     * @return MedicalStatisticsDto containing medical statistics
     */
    MedicalStatisticsDto getMedicalStatistics();

    /**
     * Get patient-specific medical summary counts used by patient dashboards.
     *
     * @param patientId patient identifier
     * @return patient-specific medical summary
     */
    PatientMedicalSummaryDto getPatientMedicalSummary(Long patientId);

    /**
     * Clear statistics cache manually
     */
    void clearStatisticsCache();
}
