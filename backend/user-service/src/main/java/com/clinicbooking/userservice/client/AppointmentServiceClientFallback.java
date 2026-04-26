package com.clinicbooking.userservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class AppointmentServiceClientFallback implements AppointmentServiceClient {

    @Override
    public List<Long> getDistinctPatientIdsForDoctor(Long doctorId) {
        log.warn(
                "Fallback: Appointment service is unavailable. Returning empty patient IDs for doctor ID: {}",
                doctorId
        );
        return List.of();
    }
}
