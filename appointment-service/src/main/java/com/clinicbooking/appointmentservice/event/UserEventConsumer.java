package com.clinicbooking.appointmentservice.event;

import com.clinicbooking.appointmentservice.entity.Appointment;
import com.clinicbooking.appointmentservice.entity.DoctorSchedule;
import com.clinicbooking.appointmentservice.repository.AppointmentRepository;
import com.clinicbooking.appointmentservice.repository.DoctorScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventConsumer {

    private final AppointmentRepository appointmentRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;

    @KafkaListener(topics = "${kafka.topics.user-updated}", groupId = "${spring.kafka.consumer.group-id}")
    @Transactional
    public void handleUserUpdated(UserEvent event) {
        log.info("Received user updated event: userId={}", event.getUserId());

        // Update denormalized data in appointments where user is patient
        List<Appointment> patientAppointments = appointmentRepository.findByPatientId(event.getUserId(), org.springframework.data.domain.Pageable.unpaged()).getContent();
        patientAppointments.forEach(appointment -> {
            appointment.setPatientName(event.getFullName());
            appointment.setPatientPhone(event.getPhone());
        });
        appointmentRepository.saveAll(patientAppointments);
        log.info("Updated {} appointments for patient: userId={}", patientAppointments.size(), event.getUserId());

        // Update denormalized data in appointments where user is doctor
        List<Appointment> doctorAppointments = appointmentRepository.findByDoctorId(event.getUserId(), org.springframework.data.domain.Pageable.unpaged()).getContent();
        doctorAppointments.forEach(appointment -> {
            appointment.setDoctorName(event.getFullName());
        });
        appointmentRepository.saveAll(doctorAppointments);
        log.info("Updated {} appointments for doctor: userId={}", doctorAppointments.size(), event.getUserId());

        // Update denormalized data in doctor schedules
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorId(event.getUserId());
        schedules.forEach(schedule -> {
            schedule.setDoctorName(event.getFullName());
        });
        doctorScheduleRepository.saveAll(schedules);
        log.info("Updated {} schedules for doctor: userId={}", schedules.size(), event.getUserId());
    }

    @KafkaListener(topics = "${kafka.topics.user-deleted}", groupId = "${spring.kafka.consumer.group-id}")
    @Transactional
    public void handleUserDeleted(UserEvent event) {
        log.info("Received user deleted event: userId={}", event.getUserId());
        // In a real system, you might want to cancel appointments or mark them as invalid
        // For now, we'll just log it
        log.warn("User deleted: userId={}. Related appointments may need attention.", event.getUserId());
    }
}
