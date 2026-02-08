package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.AppointmentCreateDto;
import com.clinicbooking.appointmentservice.dto.AppointmentFeedbackDto;
import com.clinicbooking.appointmentservice.dto.AppointmentResponseDto;
import com.clinicbooking.appointmentservice.dto.AppointmentUpdateDto;
import com.clinicbooking.appointmentservice.exception.ResourceNotFoundException;
import com.clinicbooking.appointmentservice.exception.ValidationException;
import com.clinicbooking.appointmentservice.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Locale;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentResponseDto> createAppointment(@Valid @RequestBody AppointmentCreateDto dto) {
        AppointmentResponseDto response = appointmentService.createAppointment(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> getAppointmentById(@PathVariable Long id) {
        AppointmentResponseDto response = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentUpdateDto dto) {
        AppointmentResponseDto response = appointmentService.updateAppointment(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<AppointmentResponseDto>> getAppointmentsByPatient(
            @PathVariable Long patientId, Pageable pageable) {
        Page<AppointmentResponseDto> response = appointmentService.getAppointmentsByPatient(patientId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<Page<AppointmentResponseDto>> getAppointmentsByDoctor(
            @PathVariable Long doctorId, Pageable pageable) {
        Page<AppointmentResponseDto> response = appointmentService.getAppointmentsByDoctor(doctorId, pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<AppointmentResponseDto> confirmAppointment(@PathVariable Long id) {
        AppointmentResponseDto response = appointmentService.confirmAppointment(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponseDto> cancelAppointment(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        AppointmentResponseDto response = appointmentService.cancelAppointment(id, reason);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<AppointmentResponseDto> completeAppointment(@PathVariable Long id) {
        AppointmentResponseDto response = appointmentService.completeAppointment(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/feedback")
    public ResponseEntity<AppointmentResponseDto> submitFeedback(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentFeedbackDto dto,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole) {

        String normalizedRole = currentUserRole == null ? "" : currentUserRole.trim().toUpperCase(Locale.ROOT);
        if (normalizedRole.startsWith("ROLE_")) {
            normalizedRole = normalizedRole.substring(5);
        }
        if (!"PATIENT".equals(normalizedRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only patients can submit feedback");
        }

        Long patientId;
        try {
            patientId = currentUserId == null ? null : Long.parseLong(currentUserId.trim());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid user identity");
        }
        if (patientId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing user identity");
        }

        try {
            AppointmentResponseDto response = appointmentService.submitFeedback(id, patientId, dto);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage(), ex);
        } catch (ValidationException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Page<AppointmentResponseDto>> searchAppointments(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            Pageable pageable) {
        Page<AppointmentResponseDto> response = appointmentService.searchAppointments(
                patientId, doctorId, status, fromDate, toDate, pageable);
        return ResponseEntity.ok(response);
    }
}
