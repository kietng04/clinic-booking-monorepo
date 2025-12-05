package com.clinicbooking.clinic_booking_system.controller;

import com.clinicbooking.clinic_booking_system.dto.common.ApiResponse;
import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.user.UserCreateDto;
import com.clinicbooking.clinic_booking_system.dto.user.UserResponseDto;
import com.clinicbooking.clinic_booking_system.dto.user.UserSearchCriteria;
import com.clinicbooking.clinic_booking_system.dto.user.UserUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.User;
import com.clinicbooking.clinic_booking_system.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // CREATE
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponseDto>> createUser(
            @Valid @RequestBody UserCreateDto dto) {
        UserResponseDto user = userService.createUser(dto);
        ApiResponse<UserResponseDto> response = ApiResponse.<UserResponseDto>builder()
                .success(true)
                .message("Tạo người dùng thành công")
                .data(user)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // READ
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserById(@PathVariable Long id) {
        UserResponseDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.<UserResponseDto>builder()
                .success(true)
                .data(user)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserByEmail(@PathVariable String email) {
        UserResponseDto user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.<UserResponseDto>builder()
                .success(true)
                .data(user)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping
    public ResponseEntity<PageResponse<UserResponseDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PageResponse<UserResponseDto> response = userService.getAllUsers(page, size, sortBy, sortDir);
        return ResponseEntity.ok(response);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDto dto) {
        UserResponseDto user = userService.updateUser(id, dto);
        return ResponseEntity.ok(ApiResponse.<UserResponseDto>builder()
                .success(true)
                .message("Cập nhật người dùng thành công")
                .data(user)
                .timestamp(LocalDateTime.now())
                .build());
    }

    // DELETE (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Vô hiệu hóa người dùng thành công")
                .timestamp(LocalDateTime.now())
                .build());
    }

    // SEARCH
    @GetMapping("/search")
    public ResponseEntity<PageResponse<UserResponseDto>> searchUsers(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) User.UserRole role,
            @RequestParam(required = false) User.Gender gender,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        UserSearchCriteria criteria = UserSearchCriteria.builder()
                .email(email)
                .phone(phone)
                .fullName(fullName)
                .role(role)
                .gender(gender)
                .isActive(isActive)
                .build();

        PageResponse<UserResponseDto> response = userService.searchUsers(criteria, page, size, sortBy, sortDir);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctors")
    public ResponseEntity<PageResponse<UserResponseDto>> searchDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) BigDecimal maxFee,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "rating") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PageResponse<UserResponseDto> response = userService.searchDoctors(
                specialization, minRating, maxFee, page, size, sortBy, sortDir);
        return ResponseEntity.ok(response);
    }
}
