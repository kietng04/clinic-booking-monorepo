package com.clinicbooking.appointmentservice.event;

import com.clinicbooking.appointmentservice.entity.Appointment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentEventPublisher {

    private final KafkaTemplate<String, AppointmentEvent> kafkaTemplate;

    @Value("${kafka.topics.appointment-created}")
    private String appointmentCreatedTopic;

    @Value("${kafka.topics.appointment-updated}")
    private String appointmentUpdatedTopic;

    @Value("${kafka.topics.appointment-cancelled}")
    private String appointmentCancelledTopic;

    @Value("${kafka.topics.appointment-completed}")
    private String appointmentCompletedTopic;

    public void publishAppointmentCreated(Appointment appointment) {
        AppointmentEvent event = buildAppointmentEvent(appointment, "CREATED");
        kafkaTemplate.send(appointmentCreatedTopic, appointment.getId().toString(), event);
        log.info("Published appointment created event: appointmentId={}", appointment.getId());
    }

    public void publishAppointmentUpdated(Appointment appointment) {
        AppointmentEvent event = buildAppointmentEvent(appointment, "UPDATED");
        kafkaTemplate.send(appointmentUpdatedTopic, appointment.getId().toString(), event);
        log.info("Published appointment updated event: appointmentId={}", appointment.getId());
    }

    public void publishAppointmentCancelled(Appointment appointment) {
        AppointmentEvent event = buildAppointmentEvent(appointment, "CANCELLED");
        kafkaTemplate.send(appointmentCancelledTopic, appointment.getId().toString(), event);
        log.info("Published appointment cancelled event: appointmentId={}", appointment.getId());
    }

    public void publishAppointmentCompleted(Appointment appointment) {
        AppointmentEvent event = buildAppointmentEvent(appointment, "COMPLETED");
        kafkaTemplate.send(appointmentCompletedTopic, appointment.getId().toString(), event);
        log.info("Published appointment completed event: appointmentId={}", appointment.getId());
    }

    private AppointmentEvent buildAppointmentEvent(Appointment appointment, String eventType) {
        return AppointmentEvent.builder()
                .appointmentId(appointment.getId())
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .patientName(appointment.getPatientName())
                .doctorName(appointment.getDoctorName())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus().toString())
                .type(appointment.getType() != null ? appointment.getType().toString() : null)
                .timestamp(LocalDateTime.now())
                .eventType(eventType)
                .build();
    }
}
