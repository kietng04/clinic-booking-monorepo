package com.clinicbooking.medicalservice.controller;

import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricCreateDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricResponseDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricUpdateDto;
import com.clinicbooking.medicalservice.service.HealthMetricService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/health-metrics")
@RequiredArgsConstructor
@Tag(name = "Health Metrics", description = "API quản lý chỉ số sức khỏe")
@SecurityRequirement(name = "bearerAuth")
public class HealthMetricController {

    private final HealthMetricService healthMetricService;

    @PostMapping
    @Operation(summary = "Tạo chỉ số sức khỏe mới")
    public ResponseEntity<HealthMetricResponseDto> createHealthMetric(
            @Valid @RequestBody HealthMetricCreateDto dto) {
        HealthMetricResponseDto response = healthMetricService.createHealthMetric(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chỉ số sức khỏe theo ID")
    public ResponseEntity<HealthMetricResponseDto> getHealthMetricById(@PathVariable Long id) {
        HealthMetricResponseDto response = healthMetricService.getHealthMetricById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Lấy danh sách chỉ số sức khỏe theo bệnh nhân")
    public ResponseEntity<Page<HealthMetricResponseDto>> getHealthMetricsByPatientId(
            @PathVariable Long patientId,
            Pageable pageable) {
        Page<HealthMetricResponseDto> response = healthMetricService.getHealthMetricsByPatientId(patientId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}/type/{metricType}")
    @Operation(summary = "Lấy chỉ số sức khỏe theo bệnh nhân và loại chỉ số")
    public ResponseEntity<List<HealthMetricResponseDto>> getHealthMetricsByPatientIdAndType(
            @PathVariable Long patientId,
            @PathVariable String metricType) {
        List<HealthMetricResponseDto> response = healthMetricService.getHealthMetricsByPatientIdAndType(patientId, metricType);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}/range")
    @Operation(summary = "Lấy chỉ số sức khỏe theo bệnh nhân và khoảng thời gian")
    public ResponseEntity<List<HealthMetricResponseDto>> getHealthMetricsByPatientIdAndDateRange(
            @PathVariable Long patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<HealthMetricResponseDto> response = healthMetricService.getHealthMetricsByPatientIdAndDateRange(patientId, start, end);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật chỉ số sức khỏe")
    public ResponseEntity<HealthMetricResponseDto> updateHealthMetric(
            @PathVariable Long id,
            @Valid @RequestBody HealthMetricUpdateDto dto) {
        HealthMetricResponseDto response = healthMetricService.updateHealthMetric(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa chỉ số sức khỏe")
    public ResponseEntity<Void> deleteHealthMetric(@PathVariable Long id) {
        healthMetricService.deleteHealthMetric(id);
        return ResponseEntity.noContent().build();
    }
}
