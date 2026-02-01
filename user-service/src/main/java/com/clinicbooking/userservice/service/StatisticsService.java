package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.statistics.PatientDemographicsDto;
import com.clinicbooking.userservice.dto.statistics.SpecializationDistributionDto;
import com.clinicbooking.userservice.dto.statistics.UserGrowthDto;
import com.clinicbooking.userservice.dto.statistics.UserStatisticsDto;

import java.util.List;

public interface StatisticsService {
    /**
     * Get user statistics summary
     * Includes total users, patients, doctors, and monthly statistics
     * Results are cached for 5 minutes
     *
     * @return UserStatisticsDto containing user statistics
     */
    UserStatisticsDto getUserStatistics();

    /**
     * Get user growth statistics by month
     *
     * @param months Number of months to retrieve
     * @return List of UserGrowthDto containing monthly growth data
     */
    List<UserGrowthDto> getUserGrowthByMonth(int months);

    /**
     * Get specialization distribution for doctors
     *
     * @return List of SpecializationDistributionDto containing specialization counts
     */
    List<SpecializationDistributionDto> getSpecializationDistribution();

    /**
     * Get patient demographics for a specific doctor
     *
     * @param doctorId The doctor ID
     * @return PatientDemographicsDto containing age and gender distribution
     */
    PatientDemographicsDto getPatientDemographics(Long doctorId);

    /**
     * Clear statistics cache manually
     */
    void clearStatisticsCache();
}
