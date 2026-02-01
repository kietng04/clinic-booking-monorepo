package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.*;
import com.clinicbooking.appointmentservice.service.MedicalServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class MedicalServiceController {

    private final MedicalServiceService medicalServiceService;

    @GetMapping("/clinic/{clinicId}")
    public ResponseEntity<List<MedicalServiceResponseDto>> getServicesByClinic(@PathVariable Long clinicId) {
        return ResponseEntity.ok(medicalServiceService.getServicesByClinic(clinicId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalServiceResponseDto> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(medicalServiceService.getServiceById(id));
    }

    @PostMapping
    public ResponseEntity<MedicalServiceResponseDto> createService(
            @Valid @RequestBody MedicalServiceCreateDto dto) {
        MedicalServiceResponseDto service = medicalServiceService.createService(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(service);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalServiceResponseDto> updateService(
            @PathVariable Long id,
            @Valid @RequestBody MedicalServiceCreateDto dto) {
        return ResponseEntity.ok(medicalServiceService.updateService(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        medicalServiceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggleServiceStatus(@PathVariable Long id) {
        medicalServiceService.toggleServiceStatus(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/prices")
    public ResponseEntity<ServicePriceResponseDto> addPrice(
            @PathVariable Long id,
            @Valid @RequestBody ServicePriceCreateDto dto) {
        dto.setServiceId(id);
        ServicePriceResponseDto price = medicalServiceService.addPrice(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(price);
    }

    @GetMapping("/{id}/prices")
    public ResponseEntity<List<ServicePriceResponseDto>> getPrices(@PathVariable Long id) {
        return ResponseEntity.ok(medicalServiceService.getPrices(id));
    }
}
