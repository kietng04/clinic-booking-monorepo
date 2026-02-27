package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.AdminAnalyticsDashboardDto;
import com.clinicbooking.appointmentservice.dto.AggregatedDashboardStatisticsDto;
import com.clinicbooking.appointmentservice.dto.DoctorAnalyticsDashboardDto;
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
     * Get admin analytics dashboard with time-series data
     * Includes 12-month trends, top doctors, recent activities
     * Results are cached for 5 minutes
     *
     * @return AdminAnalyticsDashboardDto containing analytics data
     */
    AdminAnalyticsDashboardDto getAdminAnalyticsDashboard();

    /**
     * Get doctor analytics dashboard with time-series data
     * Includes 6-month trends, appointment types, time slots, patient demographics
     * Results are cached for 5 minutes
     *
     * @param doctorId the doctor ID
     * @return DoctorAnalyticsDashboardDto containing analytics data
     */
    DoctorAnalyticsDashboardDto getDoctorAnalyticsDashboard(Long doctorId);

    /**
     * Clear all statistics caches manually
     */
    void clearAllStatisticsCaches();
}
