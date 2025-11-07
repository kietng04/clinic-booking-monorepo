package com.clinicbooking.clinic_booking_system.controller;

import com.clinicbooking.clinic_booking_system.dto.common.ApiResponse;
import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.medicalrecord.MedicalRecordCreateDto;
import com.clinicbooking.clinic_booking_system.dto.medicalrecord.MedicalRecordResponseDto;
import com.clinicbooking.clinic_booking_system.dto.medicalrecord.MedicalRecordUpdateDto;
import com.clinicbooking.clinic_booking_system.service.MedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {
    private final MedicalRecordService service;

    @PostMapping
    public ResponseEntity<ApiResponse<MedicalRecordResponseDto>> create(
            @Valid @RequestBody MedicalRecordCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<MedicalRecordResponseDto>builder()
                        .success(true)
                        .message("Tạo hồ sơ y tế thành công")
                        .data(service.create(dto))
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicalRecordResponseDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<MedicalRecordResponseDto>builder()
                .success(true)
                .data(service.getById(id))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<MedicalRecordResponseDto>> getByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.<MedicalRecordResponseDto>builder()
                .success(true)
                .data(service.getByAppointment(appointmentId))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/family-member/{familyMemberId}")
    public ResponseEntity<PageResponse<MedicalRecordResponseDto>> getAllByFamilyMember(
            @PathVariable Long familyMemberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(service.getAllByFamilyMember(familyMemberId, page, size, sortBy, sortDir));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<PageResponse<MedicalRecordResponseDto>> getAllByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(service.getAllByDoctor(doctorId, page, size, sortBy, sortDir));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicalRecordResponseDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody MedicalRecordUpdateDto dto) {
        return ResponseEntity.ok(ApiResponse.<MedicalRecordResponseDto>builder()
                .success(true)
                .message("Cập nhật hồ sơ y tế thành công")
                .data(service.update(id, dto))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa hồ sơ y tế thành công")
                .timestamp(LocalDateTime.now())
                .build());
    }
}
