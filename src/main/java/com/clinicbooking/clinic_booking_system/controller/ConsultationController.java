package com.clinicbooking.clinic_booking_system.controller;

import com.clinicbooking.clinic_booking_system.dto.common.ApiResponse;
import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.consultation.ConsultationCreateDto;
import com.clinicbooking.clinic_booking_system.dto.consultation.ConsultationResponseDto;
import com.clinicbooking.clinic_booking_system.dto.consultation.ConsultationUpdateDto;
import com.clinicbooking.clinic_booking_system.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {
    private final ConsultationService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ConsultationResponseDto>> create(
            @Valid @RequestBody ConsultationCreateDto dto) {
        ConsultationResponseDto consultation = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ConsultationResponseDto>builder()
                        .success(true)
                        .message("Tạo tư vấn thành công")
                        .data(consultation)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ConsultationResponseDto>> getById(@PathVariable Long id) {
        ConsultationResponseDto consultation = service.getById(id);
        return ResponseEntity.ok(ApiResponse.<ConsultationResponseDto>builder()
                .success(true)
                .data(consultation)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<PageResponse<ConsultationResponseDto>> getAllByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(service.getAllByPatient(patientId, page, size, sortBy, sortDir));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<PageResponse<ConsultationResponseDto>> getAllByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(service.getAllByDoctor(doctorId, page, size, sortBy, sortDir));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ConsultationResponseDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody ConsultationUpdateDto dto) {
        ConsultationResponseDto consultation = service.update(id, dto);
        return ResponseEntity.ok(ApiResponse.<ConsultationResponseDto>builder()
                .success(true)
                .message("Cập nhật tư vấn thành công")
                .data(consultation)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<ApiResponse<ConsultationResponseDto>> start(@PathVariable Long id) {
        ConsultationResponseDto consultation = service.start(id);
        return ResponseEntity.ok(ApiResponse.<ConsultationResponseDto>builder()
                .success(true)
                .message("Bắt đầu tư vấn thành công")
                .data(consultation)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PatchMapping("/{id}/end")
    public ResponseEntity<ApiResponse<ConsultationResponseDto>> end(@PathVariable Long id) {
        ConsultationResponseDto consultation = service.end(id);
        return ResponseEntity.ok(ApiResponse.<ConsultationResponseDto>builder()
                .success(true)
                .message("Kết thúc tư vấn thành công")
                .data(consultation)
                .timestamp(LocalDateTime.now())
                .build());
    }
}
