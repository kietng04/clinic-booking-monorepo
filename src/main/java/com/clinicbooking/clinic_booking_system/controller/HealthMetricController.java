package com.clinicbooking.clinic_booking_system.controller;

import com.clinicbooking.clinic_booking_system.dto.common.ApiResponse;
import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.healthmetric.HealthMetricCreateDto;
import com.clinicbooking.clinic_booking_system.dto.healthmetric.HealthMetricResponseDto;
import com.clinicbooking.clinic_booking_system.dto.healthmetric.HealthMetricUpdateDto;
import com.clinicbooking.clinic_booking_system.service.HealthMetricService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/health-metrics")
@RequiredArgsConstructor
public class HealthMetricController {
    private final HealthMetricService service;

    @PostMapping
    public ResponseEntity<ApiResponse<HealthMetricResponseDto>> create(
            @Valid @RequestBody HealthMetricCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<HealthMetricResponseDto>builder()
                        .success(true)
                        .message("Tạo chỉ số sức khỏe thành công")
                        .data(service.create(dto))
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HealthMetricResponseDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<HealthMetricResponseDto>builder()
                .success(true)
                .data(service.getById(id))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/family-member/{familyMemberId}")
    public ResponseEntity<PageResponse<HealthMetricResponseDto>> getAllByFamilyMember(
            @PathVariable Long familyMemberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(service.getAllByFamilyMember(familyMemberId, page, size, sortBy, sortDir));
    }

    @GetMapping("/family-member/{familyMemberId}/type/{metricType}")
    public ResponseEntity<PageResponse<HealthMetricResponseDto>> getByMetricType(
            @PathVariable Long familyMemberId,
            @PathVariable String metricType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getByMetricType(familyMemberId, metricType, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HealthMetricResponseDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody HealthMetricUpdateDto dto) {
        return ResponseEntity.ok(ApiResponse.<HealthMetricResponseDto>builder()
                .success(true)
                .message("Cập nhật chỉ số sức khỏe thành công")
                .data(service.update(id, dto))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa chỉ số sức khỏe thành công")
                .timestamp(LocalDateTime.now())
                .build());
    }
}
