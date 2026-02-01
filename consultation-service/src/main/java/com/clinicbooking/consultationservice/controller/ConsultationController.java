package com.clinicbooking.consultationservice.controller;

import com.clinicbooking.consultationservice.dto.*;
import com.clinicbooking.consultationservice.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for consultation operations
 */
@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Consultations", description = "Online consultation management endpoints")
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Create a new consultation request",
               description = "Patient creates a consultation request with a specific doctor")
    public ResponseEntity<ConsultationResponseDto> createConsultation(
            @Valid @RequestBody ConsultationRequestDto request,
            @RequestAttribute("userId") Long userId) {
        log.info("Creating consultation request for patient {}", userId);
        ConsultationResponseDto response = consultationService.createConsultation(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Get consultation by ID",
               description = "Get full details of a consultation")
    public ResponseEntity<ConsultationResponseDto> getConsultationById(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        log.info("Fetching consultation {} for user {}", id, userId);
        ConsultationResponseDto response = consultationService.getConsultationById(id, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @Operation(summary = "Get consultations by patient",
               description = "Get all consultations for a specific patient with pagination")
    public ResponseEntity<Page<ConsultationSummaryDto>> getConsultationsByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Fetching consultations for patient {}", patientId);
        Pageable pageable = PageRequest.of(page, size);
        Page<ConsultationSummaryDto> consultations =
                consultationService.getConsultationsByPatient(patientId, pageable);
        return ResponseEntity.ok(consultations);
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Get consultations by doctor",
               description = "Get all consultations for a specific doctor with pagination")
    public ResponseEntity<Page<ConsultationSummaryDto>> getConsultationsByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Fetching consultations for doctor {}", doctorId);
        Pageable pageable = PageRequest.of(page, size);
        Page<ConsultationSummaryDto> consultations =
                consultationService.getConsultationsByDoctor(doctorId, pageable);
        return ResponseEntity.ok(consultations);
    }

    @GetMapping("/doctor/{doctorId}/pending")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get pending consultations for doctor",
               description = "Get all pending consultation requests waiting for doctor acceptance")
    public ResponseEntity<List<ConsultationSummaryDto>> getPendingConsultations(
            @PathVariable Long doctorId) {
        log.info("Fetching pending consultations for doctor {}", doctorId);
        List<ConsultationSummaryDto> consultations =
                consultationService.getPendingConsultationsByDoctor(doctorId);
        return ResponseEntity.ok(consultations);
    }

    @GetMapping("/doctor/{doctorId}/active")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get active consultations for doctor",
               description = "Get all active (accepted or in-progress) consultations for doctor")
    public ResponseEntity<List<ConsultationSummaryDto>> getActiveConsultationsForDoctor(
            @PathVariable Long doctorId) {
        log.info("Fetching active consultations for doctor {}", doctorId);
        List<ConsultationSummaryDto> consultations =
                consultationService.getActiveConsultationsByDoctor(doctorId);
        return ResponseEntity.ok(consultations);
    }

    @GetMapping("/patient/{patientId}/active")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get active consultations for patient",
               description = "Get all active consultations for patient")
    public ResponseEntity<List<ConsultationSummaryDto>> getActiveConsultationsForPatient(
            @PathVariable Long patientId) {
        log.info("Fetching active consultations for patient {}", patientId);
        List<ConsultationSummaryDto> consultations =
                consultationService.getActiveConsultationsByPatient(patientId);
        return ResponseEntity.ok(consultations);
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Accept consultation request",
               description = "Doctor accepts a pending consultation request")
    public ResponseEntity<ConsultationResponseDto> acceptConsultation(
            @PathVariable Long id,
            @RequestAttribute("userId") Long doctorId) {
        log.info("Doctor {} accepting consultation {}", doctorId, id);
        ConsultationResponseDto response = consultationService.acceptConsultation(id, doctorId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Reject consultation request",
               description = "Doctor rejects a pending consultation request with a reason")
    public ResponseEntity<ConsultationResponseDto> rejectConsultation(
            @PathVariable Long id,
            @RequestAttribute("userId") Long doctorId,
            @Valid @RequestBody RejectConsultationRequestDto request) {
        log.info("Doctor {} rejecting consultation {}", doctorId, id);
        ConsultationResponseDto response = consultationService.rejectConsultation(id, doctorId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Complete consultation",
               description = "Doctor completes a consultation with notes and prescription")
    public ResponseEntity<ConsultationResponseDto> completeConsultation(
            @PathVariable Long id,
            @RequestAttribute("userId") Long doctorId,
            @Valid @RequestBody CompleteConsultationRequestDto request) {
        log.info("Doctor {} completing consultation {}", doctorId, id);
        ConsultationResponseDto response = consultationService.completeConsultation(id, doctorId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Cancel consultation",
               description = "Patient cancels a consultation request")
    public ResponseEntity<ConsultationResponseDto> cancelConsultation(
            @PathVariable Long id,
            @RequestAttribute("userId") Long patientId) {
        log.info("Patient {} cancelling consultation {}", patientId, id);
        ConsultationResponseDto response = consultationService.cancelConsultation(id, patientId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Get total unread count",
               description = "Get total number of unread messages across all consultations for user")
    public ResponseEntity<Long> getTotalUnreadCount(
            @RequestAttribute("userId") Long userId) {
        Long count = consultationService.getTotalUnreadCount(userId);
        return ResponseEntity.ok(count);
    }
}
