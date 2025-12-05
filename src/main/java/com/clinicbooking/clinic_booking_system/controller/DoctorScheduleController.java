package com.clinicbooking.clinic_booking_system.controller;

import com.clinicbooking.clinic_booking_system.dto.common.ApiResponse;
import com.clinicbooking.clinic_booking_system.dto.schedule.DoctorScheduleCreateDto;
import com.clinicbooking.clinic_booking_system.dto.schedule.DoctorScheduleResponseDto;
import com.clinicbooking.clinic_booking_system.dto.schedule.DoctorScheduleUpdateDto;
import com.clinicbooking.clinic_booking_system.service.DoctorScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class DoctorScheduleController {
    private final DoctorScheduleService service;

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorScheduleResponseDto>> create(
            @Valid @RequestBody DoctorScheduleCreateDto dto) {
        DoctorScheduleResponseDto schedule = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<DoctorScheduleResponseDto>builder()
                        .success(true)
                        .message("Tạo lịch làm việc thành công")
                        .data(schedule)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorScheduleResponseDto>> getById(@PathVariable Long id) {
        DoctorScheduleResponseDto schedule = service.getById(id);
        return ResponseEntity.ok(ApiResponse.<DoctorScheduleResponseDto>builder()
                .success(true)
                .data(schedule)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponseDto>>> getAllByDoctor(
            @PathVariable Long doctorId) {
        List<DoctorScheduleResponseDto> schedules = service.getAllByDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.<List<DoctorScheduleResponseDto>>builder()
                .success(true)
                .data(schedules)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponseDto>>> getAvailableByDay(
            @RequestParam Integer dayOfWeek) {
        List<DoctorScheduleResponseDto> schedules = service.getAvailableByDay(dayOfWeek);
        return ResponseEntity.ok(ApiResponse.<List<DoctorScheduleResponseDto>>builder()
                .success(true)
                .data(schedules)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorScheduleResponseDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody DoctorScheduleUpdateDto dto) {
        DoctorScheduleResponseDto schedule = service.update(id, dto);
        return ResponseEntity.ok(ApiResponse.<DoctorScheduleResponseDto>builder()
                .success(true)
                .message("Cập nhật lịch làm việc thành công")
                .data(schedule)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa lịch làm việc thành công")
                .timestamp(LocalDateTime.now())
                .build());
    }
}
