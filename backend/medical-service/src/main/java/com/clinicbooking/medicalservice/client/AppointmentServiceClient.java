package com.clinicbooking.medicalservice.client;

import com.clinicbooking.medicalservice.dto.AppointmentDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "appointment-service", fallback = AppointmentServiceClientFallback.class)
public interface AppointmentServiceClient {

    @GetMapping("/api/appointments/{id}")
    AppointmentDto getAppointmentById(@PathVariable("id") Long id);
}
