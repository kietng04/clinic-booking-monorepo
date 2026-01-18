package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.AggregatedDashboardStatisticsDto;
import com.clinicbooking.appointmentservice.dto.DoctorStatisticsDto;
import com.clinicbooking.appointmentservice.dto.PatientStatisticsDto;

public interface AggregateStatisticsService {

    /**
     * Get comprehensive admin dashboard statistics
     * Aggregates data from User, Appointment, and Medical services
     * Results are cached for 5 minutes
     *
     * @return AggregatedDashboardStatisticsDto containing all statistics
     */
    AggregatedDashboardStatisticsDto getAdminDashboardStatistics();

    /**
     * Get patient-specific statistics
     * Includes appointment history, medical records, and metrics
     *
     * @param patientId the patient ID
     * @return PatientStatisticsDto containing patient statistics
     */
    PatientStatisticsDto getPatientStatistics(Long patientId);

    /**
     * Get doctor-specific statistics
     * Includes appointment history, medical records created, and metrics
     *
     * @param doctorId the doctor ID
     * @return DoctorStatisticsDto containing doctor statistics
     */
    DoctorStatisticsDto getDoctorStatistics(Long doctorId);

    /**
     * Clear all statistics caches manually
     */
    void clearAllStatisticsCaches();
}
