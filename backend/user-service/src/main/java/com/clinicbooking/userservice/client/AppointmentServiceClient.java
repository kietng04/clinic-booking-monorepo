package com.clinicbooking.userservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "appointment-service", fallback = AppointmentServiceClientFallback.class)
public interface AppointmentServiceClient {

    @GetMapping("/api/appointments/internal/doctor/{doctorId}/patient-ids")
    List<Long> getDistinctPatientIdsForDoctor(@PathVariable("doctorId") Long doctorId);
}
