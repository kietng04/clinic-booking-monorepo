package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.ClinicCreateDto;
import com.clinicbooking.appointmentservice.dto.ClinicResponseDto;
import com.clinicbooking.appointmentservice.service.ClinicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clinics")
@RequiredArgsConstructor
public class ClinicController {

    private final ClinicService clinicService;

    @GetMapping
    public ResponseEntity<List<ClinicResponseDto>> getAllClinics() {
        return ResponseEntity.ok(clinicService.getAllClinics());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ClinicResponseDto>> searchClinics(
            @RequestParam(defaultValue = "") String name,
            Pageable pageable) {
        return ResponseEntity.ok(clinicService.searchClinics(name, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClinicResponseDto> getClinicById(@PathVariable Long id) {
        return ResponseEntity.ok(clinicService.getClinicById(id));
    }

    @PostMapping
    public ResponseEntity<ClinicResponseDto> createClinic(@Valid @RequestBody ClinicCreateDto dto) {
        ClinicResponseDto clinic = clinicService.createClinic(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(clinic);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClinicResponseDto> updateClinic(
            @PathVariable Long id,
            @Valid @RequestBody ClinicCreateDto dto) {
        return ResponseEntity.ok(clinicService.updateClinic(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClinic(@PathVariable Long id) {
        clinicService.deleteClinic(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggleClinicStatus(@PathVariable Long id) {
        clinicService.toggleClinicStatus(id);
        return ResponseEntity.ok().build();
    }
}
