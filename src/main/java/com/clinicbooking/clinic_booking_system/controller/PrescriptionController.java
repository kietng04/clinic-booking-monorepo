package com.clinicbooking.clinic_booking_system.controller;

import com.clinicbooking.clinic_booking_system.dto.common.ApiResponse;
import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.prescription.PrescriptionCreateDto;
import com.clinicbooking.clinic_booking_system.dto.prescription.PrescriptionResponseDto;
import com.clinicbooking.clinic_booking_system.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {
    private final PrescriptionService service;

    @PostMapping
    public ResponseEntity<ApiResponse<PrescriptionResponseDto>> create(
            @Valid @RequestBody PrescriptionCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<PrescriptionResponseDto>builder()
                        .success(true)
                        .message("Tạo đơn thuốc thành công")
                        .data(service.create(dto))
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PrescriptionResponseDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<PrescriptionResponseDto>builder()
                .success(true)
                .data(service.getById(id))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/medical-record/{medicalRecordId}")
    public ResponseEntity<PageResponse<PrescriptionResponseDto>> getAllByMedicalRecord(
            @PathVariable Long medicalRecordId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getAllByMedicalRecord(medicalRecordId, page, size));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<PageResponse<PrescriptionResponseDto>> getAllByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getAllByDoctor(doctorId, page, size));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa đơn thuốc thành công")
                .timestamp(LocalDateTime.now())
                .build());
    }
}
