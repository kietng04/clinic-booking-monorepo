package com.clinicbooking.userservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class AppointmentServiceClientFallback implements AppointmentServiceClient {

    @Override
    public List<Long> getPatientIdsForDoctor(Long doctorId) {
        log.warn("Appointment-service unavailable; returning empty patient list for doctorId={}", doctorId);
        return List.of();
    }
}
