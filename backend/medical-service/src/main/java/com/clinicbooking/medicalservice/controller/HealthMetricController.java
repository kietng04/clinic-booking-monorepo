package com.clinicbooking.medicalservice.controller;

import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricCreateDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricResponseDto;
import com.clinicbooking.medicalservice.dto.healthmetric.HealthMetricUpdateDto;
import com.clinicbooking.medicalservice.service.HealthMetricService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
    @Operation(
            summary = "Tạo chỉ số sức khỏe mới",
            description = "Ghi lại một chỉ số sức khỏe mới cho bệnh nhân. Hỗ trợ các loại chỉ số: " +
                    "BLOOD_PRESSURE, HEART_RATE, WEIGHT, HEIGHT, TEMPERATURE, BLOOD_SUGAR, BMI, OXYGEN_SATURATION"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Chỉ số sức khỏe được tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @ApiResponse(responseCode = "401", description = "Không được xác thực"),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    public ResponseEntity<HealthMetricResponseDto> createHealthMetric(
            @Valid @RequestBody HealthMetricCreateDto dto) {
        HealthMetricResponseDto response = healthMetricService.createHealthMetric(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chỉ số sức khỏe theo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy thông tin thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chỉ số sức khỏe"),
            @ApiResponse(responseCode = "401", description = "Không được xác thực")
    })
    public ResponseEntity<HealthMetricResponseDto> getHealthMetricById(
            @Parameter(description = "ID của chỉ số sức khỏe", required = true)
            @PathVariable Long id) {
        HealthMetricResponseDto response = healthMetricService.getHealthMetricById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}")
    @Operation(
            summary = "Lấy danh sách chỉ số sức khỏe theo bệnh nhân",
            description = "Lấy danh sách chỉ số sức khỏe của một bệnh nhân cụ thể với hỗ trợ phân trang"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "401", description = "Không được xác thực"),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập chỉ số sức khỏe của bệnh nhân này")
    })
    public ResponseEntity<Page<HealthMetricResponseDto>> getHealthMetricsByPatientId(
            @Parameter(description = "ID của bệnh nhân", required = true)
            @PathVariable Long patientId,
            @Parameter(description = "Thông tin phân trang")
            Pageable pageable) {
        Page<HealthMetricResponseDto> response = healthMetricService.getHealthMetricsByPatientId(patientId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}/type/{metricType}")
    @Operation(
            summary = "Lấy chỉ số sức khỏe theo bệnh nhân và loại chỉ số",
            description = "Lấy tất cả các chỉ số sức khỏe của một loại cụ thể cho một bệnh nhân"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "401", description = "Không được xác thực"),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    public ResponseEntity<List<HealthMetricResponseDto>> getHealthMetricsByPatientIdAndType(
            @Parameter(description = "ID của bệnh nhân", required = true)
            @PathVariable Long patientId,
            @Parameter(description = "Loại chỉ số (e.g., blood_pressure, heart_rate, weight)", required = true)
            @PathVariable String metricType) {
        List<HealthMetricResponseDto> response = healthMetricService.getHealthMetricsByPatientIdAndType(patientId, metricType);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}/range")
    @Operation(
            summary = "Lấy chỉ số sức khỏe theo bệnh nhân và khoảng thời gian",
            description = "Lấy tất cả các chỉ số sức khỏe của một bệnh nhân trong một khoảng thời gian cụ thể"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "400", description = "Khoảng thời gian không hợp lệ"),
            @ApiResponse(responseCode = "401", description = "Không được xác thực"),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    public ResponseEntity<List<HealthMetricResponseDto>> getHealthMetricsByPatientIdAndDateRange(
            @Parameter(description = "ID của bệnh nhân", required = true)
            @PathVariable Long patientId,
            @Parameter(description = "Ngày bắt đầu (ISO 8601 format: 2024-01-01T00:00:00)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @Parameter(description = "Ngày kết thúc (ISO 8601 format: 2024-12-31T23:59:59)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<HealthMetricResponseDto> response = healthMetricService.getHealthMetricsByPatientIdAndDateRange(patientId, start, end);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Cập nhật chỉ số sức khỏe",
            description = "Cập nhật thông tin của một chỉ số sức khỏe đã tồn tại"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chỉ số sức khỏe"),
            @ApiResponse(responseCode = "401", description = "Không được xác thực"),
            @ApiResponse(responseCode = "403", description = "Không có quyền cập nhật")
    })
    public ResponseEntity<HealthMetricResponseDto> updateHealthMetric(
            @Parameter(description = "ID của chỉ số sức khỏe", required = true)
            @PathVariable Long id,
            @Valid @RequestBody HealthMetricUpdateDto dto) {
        HealthMetricResponseDto response = healthMetricService.updateHealthMetric(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Xóa chỉ số sức khỏe",
            description = "Xóa một chỉ số sức khỏe khỏi hệ thống"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chỉ số sức khỏe"),
            @ApiResponse(responseCode = "401", description = "Không được xác thực"),
            @ApiResponse(responseCode = "403", description = "Không có quyền xóa")
    })
    public ResponseEntity<Void> deleteHealthMetric(
            @Parameter(description = "ID của chỉ số sức khỏe", required = true)
            @PathVariable Long id) {
        healthMetricService.deleteHealthMetric(id);
        return ResponseEntity.noContent().build();
    }
}
