package com.clinicbooking.medicalservice.client;

import com.clinicbooking.medicalservice.dto.AppointmentDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AppointmentServiceClientFallback implements AppointmentServiceClient {

    @Override
    public AppointmentDto getAppointmentById(Long id) {
        log.warn("Fallback: Appointment service is unavailable. Cannot fetch appointment ID: {}", id);
        // Return null to indicate service is unavailable
        // The service layer should handle this case
        return null;
    }
}
