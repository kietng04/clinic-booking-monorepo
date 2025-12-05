package com.clinicbooking.clinic_booking_system.controller;

import com.clinicbooking.clinic_booking_system.dto.aianalysis.AIAnalysisCreateDto;
import com.clinicbooking.clinic_booking_system.dto.aianalysis.AIAnalysisResponseDto;
import com.clinicbooking.clinic_booking_system.dto.aianalysis.AIAnalysisUpdateDto;
import com.clinicbooking.clinic_booking_system.dto.common.ApiResponse;
import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.entity.AIAnalysis;
import com.clinicbooking.clinic_booking_system.service.AIAnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/ai-analyses")
@RequiredArgsConstructor
public class AIAnalysisController {
    private final AIAnalysisService service;

    @PostMapping
    public ResponseEntity<ApiResponse<AIAnalysisResponseDto>> create(
            @Valid @RequestBody AIAnalysisCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<AIAnalysisResponseDto>builder()
                        .success(true)
                        .message("Tạo phân tích AI thành công")
                        .data(service.create(dto))
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AIAnalysisResponseDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<AIAnalysisResponseDto>builder()
                .success(true)
                .data(service.getById(id))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/family-member/{familyMemberId}")
    public ResponseEntity<PageResponse<AIAnalysisResponseDto>> getAllByFamilyMember(
            @PathVariable Long familyMemberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(service.getAllByFamilyMember(familyMemberId, page, size, sortBy, sortDir));
    }

    @GetMapping("/family-member/{familyMemberId}/type/{analysisType}")
    public ResponseEntity<PageResponse<AIAnalysisResponseDto>> getByAnalysisType(
            @PathVariable Long familyMemberId,
            @PathVariable String analysisType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getByAnalysisType(familyMemberId, analysisType, page, size));
    }

    @GetMapping("/severity/{severity}")
    public ResponseEntity<PageResponse<AIAnalysisResponseDto>> getBySeverity(
            @PathVariable AIAnalysis.Severity severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getBySeverity(severity, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AIAnalysisResponseDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody AIAnalysisUpdateDto dto) {
        return ResponseEntity.ok(ApiResponse.<AIAnalysisResponseDto>builder()
                .success(true)
                .message("Cập nhật phân tích AI thành công")
                .data(service.update(id, dto))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa phân tích AI thành công")
                .timestamp(LocalDateTime.now())
                .build());
    }
}
