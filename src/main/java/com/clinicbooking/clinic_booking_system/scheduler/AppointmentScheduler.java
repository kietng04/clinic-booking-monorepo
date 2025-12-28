package com.clinicbooking.clinic_booking_system.scheduler;

import com.clinicbooking.clinic_booking_system.entity.Appointment;
import com.clinicbooking.clinic_booking_system.entity.Notification;
import com.clinicbooking.clinic_booking_system.repository.AppointmentRepository;
import com.clinicbooking.clinic_booking_system.service.EmailService;
import com.clinicbooking.clinic_booking_system.service.NotificationService;
import com.clinicbooking.clinic_booking_system.dto.notification.NotificationCreateDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentScheduler {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    /**
     * Send reminder emails 24 hours before appointment
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional(readOnly = true)
    public void sendDailyReminders() {
        log.info("Running daily appointment reminder job...");

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Appointment> appointments = appointmentRepository
                .findByAppointmentDateAndStatus(tomorrow, Appointment.AppointmentStatus.CONFIRMED);

        for (Appointment appointment : appointments) {
            try {
                emailService.sendAppointmentReminder(appointment);
                createReminderNotification(appointment, "24 giờ");
                log.info("Sent 24h reminder for appointment ID: {}", appointment.getId());
            } catch (Exception e) {
                log.error("Failed to send reminder for appointment ID: {}", appointment.getId(), e);
            }
        }

        log.info("Daily reminder job completed. Sent {} reminders.", appointments.size());
    }

    /**
     * Send reminder notifications 1 hour before appointment
     * Runs every 15 minutes
     */
    @Scheduled(cron = "0 */15 * * * *")
    @Transactional(readOnly = true)
    public void sendHourlyReminders() {
        log.info("Running hourly appointment reminder job...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourLater = now.plusHours(1);

        LocalDate date = oneHourLater.toLocalDate();
        LocalTime timeStart = oneHourLater.toLocalTime().minusMinutes(7);
        LocalTime timeEnd = oneHourLater.toLocalTime().plusMinutes(8);

        List<Appointment> appointments = appointmentRepository
                .findUpcomingAppointments(date, timeStart, timeEnd, Appointment.AppointmentStatus.CONFIRMED);

        for (Appointment appointment : appointments) {
            try {
                createReminderNotification(appointment, "1 giờ");
                log.info("Sent 1h reminder for appointment ID: {}", appointment.getId());
            } catch (Exception e) {
                log.error("Failed to send 1h reminder for appointment ID: {}", appointment.getId(), e);
            }
        }

        log.info("Hourly reminder job completed. Sent {} reminders.", appointments.size());
    }

    /**
     * Auto-complete past appointments that weren't marked as completed
     * Runs daily at midnight
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void autoCompleteAppointments() {
        log.info("Running auto-complete appointments job...");

        LocalDate yesterday = LocalDate.now().minusDays(1);
        List<Appointment> appointments = appointmentRepository
                .findByAppointmentDateBeforeAndStatus(yesterday, Appointment.AppointmentStatus.CONFIRMED);

        int count = 0;
        for (Appointment appointment : appointments) {
            appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);
            count++;
        }

        log.info("Auto-complete job completed. Completed {} appointments.", count);
    }

    /**
     * Auto-cancel pending appointments that weren't confirmed within 24 hours
     * Runs daily at 6 AM
     */
    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void autoCancelPendingAppointments() {
        log.info("Running auto-cancel pending appointments job...");

        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        List<Appointment> appointments = appointmentRepository
                .findByStatusAndCreatedAtBefore(Appointment.AppointmentStatus.PENDING, cutoff);

        int count = 0;
        for (Appointment appointment : appointments) {
            appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
            appointment.setCancelReason("Tự động hủy do không được xác nhận trong 24 giờ");
            appointmentRepository.save(appointment);

            emailService.sendAppointmentCancellation(appointment);
            count++;
        }

        log.info("Auto-cancel job completed. Cancelled {} appointments.", count);
    }

    private void createReminderNotification(Appointment appointment, String timeframe) {
        String title = "Nhắc nhở lịch hẹn";
        String message = String.format(
                "Bạn có lịch hẹn với bác sĩ %s vào lúc %s ngày %s (còn %s nữa)",
                appointment.getDoctor().getFullName(),
                appointment.getAppointmentTime().toString(),
                appointment.getAppointmentDate().toString(),
                timeframe
        );

        NotificationCreateDto dto = NotificationCreateDto.builder()
                .userId(appointment.getPatient().getId())
                .type(Notification.NotificationType.REMINDER)
                .title(title)
                .message(message)
                .relatedId(appointment.getId())
                .relatedType("APPOINTMENT")
                .build();

        notificationService.create(dto);
    }
}
