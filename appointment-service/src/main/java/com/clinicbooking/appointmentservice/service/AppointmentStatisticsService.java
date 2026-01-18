package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.AppointmentStatisticsDto;

public interface AppointmentStatisticsService {
    /**
     * Get appointment statistics summary
     * Includes total appointments by status, time period, type, and calculated metrics
     * Results are cached for 5 minutes
     *
     * @return AppointmentStatisticsDto containing appointment statistics
     */
    AppointmentStatisticsDto getAppointmentStatistics();

    /**
     * Clear statistics cache manually
     */
    void clearStatisticsCache();
}
