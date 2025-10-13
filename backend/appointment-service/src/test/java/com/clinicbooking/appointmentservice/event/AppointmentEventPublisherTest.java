package com.clinicbooking.appointmentservice.event;

import com.clinicbooking.appointmentservice.entity.Appointment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AppointmentEventPublisherTest {

    @Mock
    private KafkaTemplate<String, AppointmentEvent> kafkaTemplate;

    private AppointmentEventPublisher publisher;

    @BeforeEach
    void setUp() {
        publisher = new AppointmentEventPublisher(kafkaTemplate);
        ReflectionTestUtils.setField(publisher, "appointmentCreatedTopic", "appointment.created");
        ReflectionTestUtils.setField(publisher, "appointmentUpdatedTopic", "appointment.updated");
        ReflectionTestUtils.setField(publisher, "appointmentCancelledTopic", "appointment.cancelled");
        ReflectionTestUtils.setField(publisher, "appointmentCompletedTopic", "appointment.completed");
    }

    @Test
    void publishAppointmentCompleted_shouldSendToCompletedTopic() {
        Appointment appointment = Appointment.builder()
                .id(11L)
                .patientId(101L)
                .doctorId(202L)
                .patientName("Patient A")
                .doctorName("Doctor B")
                .appointmentDate(LocalDate.of(2026, 2, 8))
                .appointmentTime(LocalTime.of(9, 0))
                .status(Appointment.AppointmentStatus.COMPLETED)
                .type(Appointment.AppointmentType.IN_PERSON)
                .build();

        publisher.publishAppointmentCompleted(appointment);

        verify(kafkaTemplate).send(
                eq("appointment.completed"),
                eq("11"),
                argThat(event ->
                        event != null
                                && "COMPLETED".equals(event.getEventType())
                                && "COMPLETED".equals(event.getStatus())
                                && event.getAppointmentId().equals(11L)
                )
        );
    }
}
