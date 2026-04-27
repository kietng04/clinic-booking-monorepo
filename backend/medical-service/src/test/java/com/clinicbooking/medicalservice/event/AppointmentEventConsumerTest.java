package com.clinicbooking.medicalservice.event;

import org.junit.jupiter.api.Test;

class AppointmentEventConsumerTest {

    @Test
    void handleAppointmentCompletedAcceptsEventWithoutThrowing() {
        AppointmentEventConsumer consumer = new AppointmentEventConsumer();
        AppointmentEvent event = AppointmentEvent.builder()
                .appointmentId(11L)
                .patientId(22L)
                .doctorId(33L)
                .status("COMPLETED")
                .build();

        consumer.handleAppointmentCompleted(event);
    }
}
