package com.clinicbooking.clinic_booking_system.controller;

import com.clinicbooking.clinic_booking_system.dto.common.ApiResponse;
import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.familymember.FamilyMemberCreateDto;
import com.clinicbooking.clinic_booking_system.dto.familymember.FamilyMemberResponseDto;
import com.clinicbooking.clinic_booking_system.dto.familymember.FamilyMemberUpdateDto;
import com.clinicbooking.clinic_booking_system.service.FamilyMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/family-members")
@RequiredArgsConstructor
public class FamilyMemberController {
    private final FamilyMemberService service;

    @PostMapping
    public ResponseEntity<ApiResponse<FamilyMemberResponseDto>> create(
            @Valid @RequestBody FamilyMemberCreateDto dto) {
        FamilyMemberResponseDto member = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<FamilyMemberResponseDto>builder()
                        .success(true)
                        .message("Tạo thành viên gia đình thành công")
                        .data(member)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FamilyMemberResponseDto>> getById(@PathVariable Long id) {
        FamilyMemberResponseDto member = service.getById(id);
        return ResponseEntity.ok(ApiResponse.<FamilyMemberResponseDto>builder()
                .success(true)
                .data(member)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<PageResponse<FamilyMemberResponseDto>> getAllByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(service.getAllByUser(userId, page, size, sortBy, sortDir));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FamilyMemberResponseDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody FamilyMemberUpdateDto dto) {
        FamilyMemberResponseDto member = service.update(id, dto);
        return ResponseEntity.ok(ApiResponse.<FamilyMemberResponseDto>builder()
                .success(true)
                .message("Cập nhật thành viên gia đình thành công")
                .data(member)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa thành viên gia đình thành công")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<FamilyMemberResponseDto>> search(
            @RequestParam Long userId,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String relationship,
            @RequestParam(required = false) String gender,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(service.search(userId, fullName, relationship, gender, page, size, sortBy, sortDir));
    }
}
