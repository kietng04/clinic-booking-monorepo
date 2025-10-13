package com.clinicbooking.medicalservice.controller;

import com.clinicbooking.medicalservice.dto.medication.MedicationCreateDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationResponseDto;
import com.clinicbooking.medicalservice.dto.medication.MedicationUpdateDto;
import com.clinicbooking.medicalservice.service.MedicationService;
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

import java.util.List;

@RestController
@RequestMapping("/api/medications")
@RequiredArgsConstructor
@Tag(name = "Medications", description = "API quản lý danh mục thuốc")
@SecurityRequirement(name = "bearerAuth")
public class MedicationController {

    private final MedicationService medicationService;

    @PostMapping
    @Operation(summary = "Tạo thuốc mới (Admin)")
    public ResponseEntity<MedicationResponseDto> createMedication(
            @Valid @RequestBody MedicationCreateDto dto) {
        MedicationResponseDto response = medicationService.createMedication(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thuốc theo ID")
    public ResponseEntity<MedicationResponseDto> getMedicationById(@PathVariable Long id) {
        MedicationResponseDto response = medicationService.getMedicationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách thuốc với filter và pagination")
    public ResponseEntity<Page<MedicationResponseDto>> getMedications(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isActive,
            Pageable pageable) {
        Page<MedicationResponseDto> response = medicationService.getMedicationsWithFilters(
                search, category, isActive, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    @Operation(summary = "Lấy tất cả thuốc đang hoạt động (cho dropdown)")
    public ResponseEntity<List<MedicationResponseDto>> getAllActiveMedications() {
        List<MedicationResponseDto> response = medicationService.getAllActiveMedications();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm thuốc theo tên hoặc tên gốc")
    public ResponseEntity<List<MedicationResponseDto>> searchMedications(
            @RequestParam String q) {
        List<MedicationResponseDto> response = medicationService.searchMedications(q);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Lấy thuốc theo danh mục")
    public ResponseEntity<List<MedicationResponseDto>> getMedicationsByCategory(
            @PathVariable String category) {
        List<MedicationResponseDto> response = medicationService.getMedicationsByCategory(category);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/categories")
    @Operation(summary = "Lấy danh sách các danh mục thuốc")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> response = medicationService.getAllCategories();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thuốc (Admin)")
    public ResponseEntity<MedicationResponseDto> updateMedication(
            @PathVariable Long id,
            @Valid @RequestBody MedicationUpdateDto dto) {
        MedicationResponseDto response = medicationService.updateMedication(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa thuốc - soft delete (Admin)")
    public ResponseEntity<Void> deleteMedication(@PathVariable Long id) {
        medicationService.deleteMedication(id);
        return ResponseEntity.noContent().build();
    }
}
