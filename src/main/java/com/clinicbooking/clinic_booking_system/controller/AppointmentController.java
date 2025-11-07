package com.clinicbooking.clinic_booking_system.controller;

import com.clinicbooking.clinic_booking_system.dto.appointment.AppointmentCreateDto;
import com.clinicbooking.clinic_booking_system.dto.appointment.AppointmentResponseDto;
import com.clinicbooking.clinic_booking_system.dto.appointment.AppointmentSearchCriteria;
import com.clinicbooking.clinic_booking_system.dto.appointment.AppointmentUpdateDto;
import com.clinicbooking.clinic_booking_system.dto.common.ApiResponse;
import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.entity.Appointment;
import com.clinicbooking.clinic_booking_system.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService service;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> create(
            @Valid @RequestBody AppointmentCreateDto dto) {
        AppointmentResponseDto appointment = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<AppointmentResponseDto>builder()
                        .success(true)
                        .message("Tạo lịch hẹn thành công")
                        .data(appointment)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> getById(@PathVariable Long id) {
        AppointmentResponseDto appointment = service.getById(id);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponseDto>builder()
                .success(true)
                .data(appointment)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<PageResponse<AppointmentResponseDto>> getAllByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(service.getAllByPatient(patientId, page, size, sortBy, sortDir));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<PageResponse<AppointmentResponseDto>> getAllByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(service.getAllByDoctor(doctorId, page, size, sortBy, sortDir));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentUpdateDto dto) {
        AppointmentResponseDto appointment = service.update(id, dto);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponseDto>builder()
                .success(true)
                .message("Cập nhật lịch hẹn thành công")
                .data(appointment)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Hủy lịch hẹn thành công")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> confirm(@PathVariable Long id) {
        AppointmentResponseDto appointment = service.confirm(id);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponseDto>builder()
                .success(true)
                .message("Xác nhận lịch hẹn thành công")
                .data(appointment)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> complete(@PathVariable Long id) {
        AppointmentResponseDto appointment = service.complete(id);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponseDto>builder()
                .success(true)
                .message("Hoàn thành lịch hẹn thành công")
                .data(appointment)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> cancel(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        AppointmentResponseDto appointment = service.cancel(id, reason);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponseDto>builder()
                .success(true)
                .message("Hủy lịch hẹn thành công")
                .data(appointment)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<AppointmentResponseDto>> search(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Appointment.AppointmentStatus status,
            @RequestParam(required = false) Appointment.AppointmentType type,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        AppointmentSearchCriteria criteria = AppointmentSearchCriteria.builder()
                .patientId(patientId)
                .doctorId(doctorId)
                .status(status)
                .type(type)
                .startDate(startDate)
                .endDate(endDate)
                .build();

        return ResponseEntity.ok(service.search(criteria, page, size, sortBy, sortDir));
    }
}
