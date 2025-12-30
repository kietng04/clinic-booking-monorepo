package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.DoctorScheduleCreateDto;
import com.clinicbooking.appointmentservice.dto.DoctorScheduleResponseDto;
import com.clinicbooking.appointmentservice.dto.DoctorScheduleUpdateDto;
import com.clinicbooking.appointmentservice.service.DoctorScheduleService;
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
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
@Tag(name = "Doctor Schedules", description = "API quản lý lịch làm việc của bác sĩ")
@SecurityRequirement(name = "bearerAuth")
public class DoctorScheduleController {

    private final DoctorScheduleService scheduleService;

    @PostMapping
    @Operation(summary = "Tạo lịch làm việc mới cho bác sĩ")
    public ResponseEntity<DoctorScheduleResponseDto> createSchedule(@Valid @RequestBody DoctorScheduleCreateDto dto) {
        DoctorScheduleResponseDto response = scheduleService.createSchedule(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy lịch làm việc theo ID")
    public ResponseEntity<DoctorScheduleResponseDto> getScheduleById(@PathVariable Long id) {
        DoctorScheduleResponseDto response = scheduleService.getScheduleById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Lấy tất cả lịch làm việc của bác sĩ")
    public ResponseEntity<List<DoctorScheduleResponseDto>> getSchedulesByDoctorId(@PathVariable Long doctorId) {
        List<DoctorScheduleResponseDto> response = scheduleService.getSchedulesByDoctorId(doctorId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctor/{doctorId}/day/{dayOfWeek}")
    @Operation(summary = "Lấy lịch làm việc của bác sĩ theo ngày trong tuần")
    public ResponseEntity<List<DoctorScheduleResponseDto>> getSchedulesByDoctorIdAndDay(
            @PathVariable Long doctorId,
            @PathVariable Integer dayOfWeek) {
        List<DoctorScheduleResponseDto> response = scheduleService.getSchedulesByDoctorIdAndDay(doctorId, dayOfWeek);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Lấy tất cả lịch làm việc")
    public ResponseEntity<Page<DoctorScheduleResponseDto>> getAllSchedules(Pageable pageable) {
        Page<DoctorScheduleResponseDto> response = scheduleService.getAllSchedules(pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật lịch làm việc")
    public ResponseEntity<DoctorScheduleResponseDto> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody DoctorScheduleUpdateDto dto) {
        DoctorScheduleResponseDto response = scheduleService.updateSchedule(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa lịch làm việc")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
