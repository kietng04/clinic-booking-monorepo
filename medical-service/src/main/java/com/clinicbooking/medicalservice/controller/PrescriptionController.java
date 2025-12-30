package com.clinicbooking.medicalservice.controller;

import com.clinicbooking.medicalservice.dto.prescription.PrescriptionCreateDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionResponseDto;
import com.clinicbooking.medicalservice.dto.prescription.PrescriptionUpdateDto;
import com.clinicbooking.medicalservice.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescriptions", description = "API quản lý đơn thuốc")
@SecurityRequirement(name = "bearerAuth")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping("/medical-record/{medicalRecordId}")
    @Operation(summary = "Thêm đơn thuốc vào hồ sơ y tế")
    public ResponseEntity<PrescriptionResponseDto> addPrescription(
            @PathVariable Long medicalRecordId,
            @Valid @RequestBody PrescriptionCreateDto dto) {
        PrescriptionResponseDto response = prescriptionService.addPrescription(medicalRecordId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy đơn thuốc theo ID")
    public ResponseEntity<PrescriptionResponseDto> getPrescriptionById(@PathVariable Long id) {
        PrescriptionResponseDto response = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/medical-record/{medicalRecordId}")
    @Operation(summary = "Lấy danh sách đơn thuốc theo hồ sơ y tế")
    public ResponseEntity<Page<PrescriptionResponseDto>> getPrescriptionsByMedicalRecordId(
            @PathVariable Long medicalRecordId,
            Pageable pageable) {
        Page<PrescriptionResponseDto> response = prescriptionService.getPrescriptionsByMedicalRecordId(medicalRecordId, pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật đơn thuốc")
    public ResponseEntity<PrescriptionResponseDto> updatePrescription(
            @PathVariable Long id,
            @Valid @RequestBody PrescriptionUpdateDto dto) {
        PrescriptionResponseDto response = prescriptionService.updatePrescription(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa đơn thuốc")
    public ResponseEntity<Void> deletePrescription(@PathVariable Long id) {
        prescriptionService.deletePrescription(id);
        return ResponseEntity.noContent().build();
    }
}
