package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.client.MedicalServiceClient;
import com.clinicbooking.appointmentservice.client.UserServiceClient;
import com.clinicbooking.appointmentservice.dto.*;
import com.clinicbooking.appointmentservice.entity.Appointment;
import com.clinicbooking.appointmentservice.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AggregateStatisticsServiceImpl implements AggregateStatisticsService {

    private final AppointmentRepository appointmentRepository;
    private final UserServiceClient userServiceClient;
    private final MedicalServiceClient medicalServiceClient;

    private static final int CACHE_DURATION_MINUTES = 5;

    @Override
    @Cacheable(value = "dashboardStatistics", unless = "#result == null")
    public AggregatedDashboardStatisticsDto getAdminDashboardStatistics() {
        log.info("Fetching aggregated dashboard statistics");

        try {
            // Get statistics from each service
            UserStatisticsDto userStats = userServiceClient.getUserStatistics();
            AppointmentStatisticsDto appointmentStats = getAppointmentStatistics();
            MedicalStatisticsDto medicalStats = medicalServiceClient.getMedicalStatistics();

            // Calculate system health metrics
            AggregatedDashboardStatisticsDto.SystemHealthDto systemHealth = calculateSystemHealth(
                    userStats, appointmentStats, medicalStats
            );

            return AggregatedDashboardStatisticsDto.builder()
                    .userStatistics(userStats)
                    .appointmentStatistics(appointmentStats)
                    .medicalStatistics(medicalStats)
                    .systemHealth(systemHealth)
                    .generatedAt(LocalDateTime.now())
                    .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching aggregated dashboard statistics", e);
            throw new RuntimeException("Failed to fetch dashboard statistics", e);
        }
    }

    @Override
    @Cacheable(value = "patientStatistics", key = "#patientId", unless = "#result == null")
    public PatientStatisticsDto getPatientStatistics(Long patientId) {
        log.info("Fetching patient statistics for patient: {}", patientId);

        try {
            List<Appointment> patientAppointments = appointmentRepository
                    .findByPatientId(patientId, org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
                    .getContent();

            if (patientAppointments.isEmpty()) {
                log.warn("No appointments found for patient: {}", patientId);
                return PatientStatisticsDto.builder()
                        .patientId(patientId)
                        .totalAppointments(0L)
                        .completedAppointments(0L)
                        .upcomingAppointments(0L)
                        .cancelledAppointments(0L)
                        .totalMedicalRecords(0L)
                        .totalPrescriptions(0L)
                        .completionRate(0.0)
                        .avgAppointmentsPerMonth(0.0)
                        .generatedAt(LocalDateTime.now())
                        .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                        .build();
            }

            long totalAppointments = patientAppointments.size();
            long completedAppointments = patientAppointments.stream()
                    .filter(a -> a.getStatus() == Appointment.AppointmentStatus.COMPLETED)
                    .count();
            long upcomingAppointments = patientAppointments.stream()
                    .filter(a -> a.getAppointmentDate().isAfter(LocalDate.now()) &&
                            (a.getStatus() == Appointment.AppointmentStatus.PENDING ||
                             a.getStatus() == Appointment.AppointmentStatus.CONFIRMED))
                    .count();
            long cancelledAppointments = patientAppointments.stream()
                    .filter(a -> a.getStatus() == Appointment.AppointmentStatus.CANCELLED)
                    .count();

            // Get most frequent doctor
            Long frequentDoctorId = patientAppointments.stream()
                    .map(Appointment::getDoctorId)
                    .distinct()
                    .findFirst()
                    .orElse(null);

            // Get last appointment date
            String lastAppointmentDate = patientAppointments.stream()
                    .map(a -> a.getAppointmentDate().toString())
                    .findFirst()
                    .orElse(null);

            // Calculate metrics
            double completionRate = totalAppointments > 0 ? (completedAppointments * 100.0) / totalAppointments : 0.0;

            // Estimate months with appointments
            long monthsWithAppointments = patientAppointments.stream()
                    .map(a -> YearMonth.from(a.getAppointmentDate()))
                    .distinct()
                    .count();
            monthsWithAppointments = Math.max(monthsWithAppointments, 1);
            double avgAppointmentsPerMonth = (totalAppointments * 1.0) / monthsWithAppointments;

            return PatientStatisticsDto.builder()
                    .patientId(patientId)
                    .totalAppointments(totalAppointments)
                    .completedAppointments(completedAppointments)
                    .upcomingAppointments(upcomingAppointments)
                    .cancelledAppointments(cancelledAppointments)
                    .frequentDoctorId(frequentDoctorId)
                    .lastAppointmentDate(lastAppointmentDate)
                    .completionRate(Math.round(completionRate * 100.0) / 100.0)
                    .avgAppointmentsPerMonth(Math.round(avgAppointmentsPerMonth * 100.0) / 100.0)
                    .generatedAt(LocalDateTime.now())
                    .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching patient statistics for patientId: {}", patientId, e);
            throw new RuntimeException("Failed to fetch patient statistics", e);
        }
    }

    @Override
    @Cacheable(value = "doctorStatistics", key = "#doctorId", unless = "#result == null")
    public DoctorStatisticsDto getDoctorStatistics(Long doctorId) {
        log.info("Fetching doctor statistics for doctor: {}", doctorId);

        try {
            List<Appointment> doctorAppointments = appointmentRepository
                    .findByDoctorId(doctorId, org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
                    .getContent();

            if (doctorAppointments.isEmpty()) {
                log.warn("No appointments found for doctor: {}", doctorId);
                return DoctorStatisticsDto.builder()
                        .doctorId(doctorId)
                        .totalAppointments(0L)
                        .completedAppointments(0L)
                        .pendingAppointments(0L)
                        .cancelledAppointments(0L)
                        .uniquePatients(0L)
                        .completionRate(0.0)
                        .avgAppointmentsPerWeek(0.0)
                        .generatedAt(LocalDateTime.now())
                        .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                        .build();
            }

            long totalAppointments = doctorAppointments.size();
            long completedAppointments = doctorAppointments.stream()
                    .filter(a -> a.getStatus() == Appointment.AppointmentStatus.COMPLETED)
                    .count();
            long pendingAppointments = doctorAppointments.stream()
                    .filter(a -> a.getStatus() == Appointment.AppointmentStatus.PENDING)
                    .count();
            long cancelledAppointments = doctorAppointments.stream()
                    .filter(a -> a.getStatus() == Appointment.AppointmentStatus.CANCELLED)
                    .count();
            long uniquePatients = doctorAppointments.stream()
                    .map(Appointment::getPatientId)
                    .distinct()
                    .count();

            // Get last appointment date
            String lastAppointmentDate = doctorAppointments.stream()
                    .map(a -> a.getAppointmentDate().toString())
                    .findFirst()
                    .orElse(null);

            // Appointments this month
            LocalDate today = LocalDate.now();
            LocalDate monthStart = today.withDayOfMonth(1);
            long appointmentsThisMonth = doctorAppointments.stream()
                    .filter(a -> !a.getAppointmentDate().isBefore(monthStart))
                    .count();

            // Calculate metrics
            double completionRate = totalAppointments > 0 ? (completedAppointments * 100.0) / totalAppointments : 0.0;
            double avgAppointmentsPerWeek = (totalAppointments * 1.0) / 52; // Rough estimate

            return DoctorStatisticsDto.builder()
                    .doctorId(doctorId)
                    .totalAppointments(totalAppointments)
                    .completedAppointments(completedAppointments)
                    .pendingAppointments(pendingAppointments)
                    .cancelledAppointments(cancelledAppointments)
                    .uniquePatients(uniquePatients)
                    .completionRate(Math.round(completionRate * 100.0) / 100.0)
                    .avgAppointmentsPerWeek(Math.round(avgAppointmentsPerWeek * 100.0) / 100.0)
                    .lastAppointmentDate(lastAppointmentDate)
                    .appointmentsThisMonth(appointmentsThisMonth)
                    .generatedAt(LocalDateTime.now())
                    .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching doctor statistics for doctorId: {}", doctorId, e);
            throw new RuntimeException("Failed to fetch doctor statistics", e);
        }
    }

    @Override
    @CacheEvict(value = {"dashboardStatistics", "patientStatistics", "doctorStatistics"}, allEntries = true)
    public void clearAllStatisticsCaches() {
        log.info("Cleared all statistics caches");
    }

    /**
     * Get appointment statistics (local - no Feign call)
     */
    private AppointmentStatisticsDto getAppointmentStatistics() {
        long totalAppointments = appointmentRepository.count();
        long pendingAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.PENDING);
        long confirmedAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.CONFIRMED);
        long completedAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.COMPLETED);
        long cancelledAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.CANCELLED);

        long appointmentsToday = appointmentRepository.countAppointmentsToday();
        long appointmentsThisMonth = appointmentRepository.countAppointmentsThisMonth();

        double completionRate = totalAppointments > 0 ? (completedAppointments * 100.0) / totalAppointments : 0.0;

        return AppointmentStatisticsDto.builder()
                .totalAppointments(totalAppointments)
                .pendingAppointments(pendingAppointments)
                .confirmedAppointments(confirmedAppointments)
                .completedAppointments(completedAppointments)
                .cancelledAppointments(cancelledAppointments)
                .appointmentsToday(appointmentsToday)
                .appointmentsThisMonth(appointmentsThisMonth)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .generatedAt(LocalDateTime.now())
                .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                .build();
    }

    /**
     * Calculate system health metrics
     */
    private AggregatedDashboardStatisticsDto.SystemHealthDto calculateSystemHealth(
            UserStatisticsDto userStats,
            AppointmentStatisticsDto appointmentStats,
            MedicalStatisticsDto medicalStats) {

        long totalActiveUsers = userStats.getActiveUsers();
        double appointmentCompletionRate = appointmentStats.getCompletionRate();
        double avgDailyAppointments = appointmentStats.getAvgAppointmentsPerDay();

        // Calculate utilization rate (active doctors / total doctors * 100)
        double utilizationRate = userStats.getTotalDoctors() > 0 ?
                (appointmentStats.getTotalAppointments() / (userStats.getTotalDoctors() * 20.0)) * 100 : 0.0;
        utilizationRate = Math.min(utilizationRate, 100.0); // Cap at 100%

        // Calculate doctor to patient ratio
        double doctorPatientRatio = userStats.getTotalDoctors() > 0 ?
                (userStats.getTotalPatients() * 1.0) / userStats.getTotalDoctors() : 0.0;

        // Count pending actions
        long pendingActionsCount = appointmentStats.getPendingAppointments() +
                (userStats.getInactiveUsers() > 0 ? 1 : 0) +
                (appointmentStats.getCancelledAppointments() > 10 ? 1 : 0);

        return AggregatedDashboardStatisticsDto.SystemHealthDto.builder()
                .totalActiveUsers(totalActiveUsers)
                .completionRate(appointmentCompletionRate)
                .avgDailyAppointments(Math.round(avgDailyAppointments * 100.0) / 100.0)
                .utilizationRate(Math.round(utilizationRate * 100.0) / 100.0)
                .doctorPatientRatio(Math.round(doctorPatientRatio * 100.0) / 100.0)
                .pendingActionsCount(pendingActionsCount)
                .build();
    }
}
