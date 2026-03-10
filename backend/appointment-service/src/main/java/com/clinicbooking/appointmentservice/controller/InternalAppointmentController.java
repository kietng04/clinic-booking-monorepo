package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/appointments/internal")
@RequiredArgsConstructor
public class InternalAppointmentController {

    private final AppointmentRepository appointmentRepository;

    @GetMapping("/doctor/{doctorId}/patient-ids")
    public ResponseEntity<List<Long>> getDistinctPatientIdsForDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentRepository.getDistinctPatientIdsForDoctor(doctorId));
    }
}
