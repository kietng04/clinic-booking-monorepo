package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.statistics.UserStatisticsDto;

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
     * Clear statistics cache manually
     */
    void clearStatisticsCache();
}
