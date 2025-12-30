package com.clinicbooking.medicalservice.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentEventConsumer {

    @KafkaListener(topics = "${kafka.topics.appointment-completed}", groupId = "${spring.kafka.consumer.group-id}")
    @Transactional
    public void handleAppointmentCompleted(AppointmentEvent event) {
        log.info("Received appointment completed event: appointmentId={}", event.getAppointmentId());

        // Here you could implement logic to automatically create a medical record
        // when an appointment is completed, or send a reminder to the doctor
        // to create a medical record for the appointment

        // For now, just log the event
        log.info("Appointment completed - ready for medical record creation: appointmentId={}, patientId={}, doctorId={}",
                event.getAppointmentId(), event.getPatientId(), event.getDoctorId());
    }
}
