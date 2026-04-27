package com.clinicbooking.medicalservice.client;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AppointmentServiceClientFallbackTest {

    @Test
    void getAppointmentByIdReturnsNullWhenServiceIsUnavailable() {
        AppointmentServiceClientFallback fallback = new AppointmentServiceClientFallback();

        assertThat(fallback.getAppointmentById(123L)).isNull();
    }
}
