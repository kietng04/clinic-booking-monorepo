package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.AppointmentStatisticsDto;
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
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AppointmentStatisticsServiceImpl implements AppointmentStatisticsService {

    private final AppointmentRepository appointmentRepository;
    private static final int CACHE_DURATION_MINUTES = 5;

    @Override
    @Cacheable(value = "appointmentStatistics", unless = "#result == null")
    public AppointmentStatisticsDto getAppointmentStatistics() {
        log.info("Fetching appointment statistics from database");

        try {
            // Get total counts by status using efficient COUNT queries
            long totalAppointments = appointmentRepository.count();
            long pendingAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.PENDING);
            long confirmedAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.CONFIRMED);
            long completedAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.COMPLETED);
            long cancelledAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.CANCELLED);

            // Get appointments by time period using efficient queries
            long appointmentsToday = appointmentRepository.countAppointmentsToday();
            long appointmentsThisWeek = appointmentRepository.countAppointmentsThisWeek();
            long appointmentsThisMonth = appointmentRepository.countAppointmentsThisMonth();

            // Get appointments by type
            long inPersonAppointments = appointmentRepository.countByType(Appointment.AppointmentType.IN_PERSON);
            long onlineAppointments = appointmentRepository.countByType(Appointment.AppointmentType.ONLINE);

            // Get appointments by priority
            long urgentAppointments = appointmentRepository.countByPriority(Appointment.Priority.URGENT);
            long normalAppointments = appointmentRepository.countByPriority(Appointment.Priority.NORMAL);

            // Get upcoming appointments (future date with pending or confirmed status)
            long upcomingAppointments = appointmentRepository.countUpcomingAppointments();

            // Calculate metrics
            double completionRate = totalAppointments > 0 ? (completedAppointments * 100.0) / totalAppointments : 0.0;
            double cancellationRate = totalAppointments > 0 ? (cancelledAppointments * 100.0) / totalAppointments : 0.0;

            // Calculate days in current month
            LocalDate now = LocalDate.now();
            int daysInMonth = now.lengthOfMonth();
            double avgAppointmentsPerDay = appointmentsThisMonth > 0 ?
                    (appointmentsThisMonth * 1.0) / daysInMonth : 0.0;

            return AppointmentStatisticsDto.builder()
                    .totalAppointments(totalAppointments)
                    .pendingAppointments(pendingAppointments)
                    .confirmedAppointments(confirmedAppointments)
                    .completedAppointments(completedAppointments)
                    .cancelledAppointments(cancelledAppointments)
                    .appointmentsToday(appointmentsToday)
                    .appointmentsThisWeek(appointmentsThisWeek)
                    .appointmentsThisMonth(appointmentsThisMonth)
                    .inPersonAppointments(inPersonAppointments)
                    .onlineAppointments(onlineAppointments)
                    .urgentAppointments(urgentAppointments)
                    .normalAppointments(normalAppointments)
                    .upcomingAppointments(upcomingAppointments)
                    .completionRate(Math.round(completionRate * 100.0) / 100.0)
                    .cancellationRate(Math.round(cancellationRate * 100.0) / 100.0)
                    .avgAppointmentsPerDay(Math.round(avgAppointmentsPerDay * 100.0) / 100.0)
                    .generatedAt(LocalDateTime.now())
                    .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching appointment statistics", e);
            throw new RuntimeException("Failed to fetch appointment statistics", e);
        }
    }

    @Override
    @CacheEvict(value = "appointmentStatistics", allEntries = true)
    public void clearStatisticsCache() {
        log.info("Cleared appointment statistics cache");
    }
}
