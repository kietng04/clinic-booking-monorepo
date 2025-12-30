package com.clinicbooking.medicalservice.controller;

import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordCreateDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordResponseDto;
import com.clinicbooking.medicalservice.dto.medicalrecord.MedicalRecordUpdateDto;
import com.clinicbooking.medicalservice.service.MedicalRecordService;
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
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
@Tag(name = "Medical Records", description = "API quản lý hồ sơ y tế")
@SecurityRequirement(name = "bearerAuth")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping
    @Operation(summary = "Tạo hồ sơ y tế mới")
    public ResponseEntity<MedicalRecordResponseDto> createMedicalRecord(
            @Valid @RequestBody MedicalRecordCreateDto dto) {
        MedicalRecordResponseDto response = medicalRecordService.createMedicalRecord(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy hồ sơ y tế theo ID")
    public ResponseEntity<MedicalRecordResponseDto> getMedicalRecordById(@PathVariable Long id) {
        MedicalRecordResponseDto response = medicalRecordService.getMedicalRecordById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Lấy danh sách hồ sơ y tế theo bệnh nhân")
    public ResponseEntity<Page<MedicalRecordResponseDto>> getMedicalRecordsByPatientId(
            @PathVariable Long patientId,
            Pageable pageable) {
        Page<MedicalRecordResponseDto> response = medicalRecordService.getMedicalRecordsByPatientId(patientId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Lấy danh sách hồ sơ y tế theo bác sĩ")
    public ResponseEntity<Page<MedicalRecordResponseDto>> getMedicalRecordsByDoctorId(
            @PathVariable Long doctorId,
            Pageable pageable) {
        Page<MedicalRecordResponseDto> response = medicalRecordService.getMedicalRecordsByDoctorId(doctorId, pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật hồ sơ y tế")
    public ResponseEntity<MedicalRecordResponseDto> updateMedicalRecord(
            @PathVariable Long id,
            @Valid @RequestBody MedicalRecordUpdateDto dto) {
        MedicalRecordResponseDto response = medicalRecordService.updateMedicalRecord(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa hồ sơ y tế")
    public ResponseEntity<Void> deleteMedicalRecord(@PathVariable Long id) {
        medicalRecordService.deleteMedicalRecord(id);
        return ResponseEntity.noContent().build();
    }
}
