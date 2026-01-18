package com.clinicbooking.medicalservice.service;

import com.clinicbooking.medicalservice.dto.MedicalStatisticsDto;

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
     * Clear statistics cache manually
     */
    void clearStatisticsCache();
}
