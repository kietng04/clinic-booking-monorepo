package com.clinicbooking.userservice.controller;

import com.clinicbooking.userservice.dto.user.UserCreateDto;
import com.clinicbooking.userservice.dto.user.UserResponseDto;
import com.clinicbooking.userservice.dto.user.UserUpdateDto;
import com.clinicbooking.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "API quản lý người dùng")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Tạo người dùng mới")
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody UserCreateDto dto) {
        UserResponseDto user = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin người dùng theo ID")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        UserResponseDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả người dùng")
    public ResponseEntity<Page<UserResponseDto>> getAllUsers(Pageable pageable) {
        Page<UserResponseDto> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role/{role}")
    @Operation(summary = "Lấy danh sách người dùng theo vai trò")
    public ResponseEntity<List<UserResponseDto>> getUsersByRole(@PathVariable String role) {
        List<UserResponseDto> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin người dùng")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDto dto) {
        UserResponseDto user = userService.updateUser(id, dto);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa người dùng")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy thông tin hồ sơ người dùng hiện tại")
    public ResponseEntity<UserResponseDto> getCurrentUserProfile(Authentication authentication) {
        String email = authentication.getName();
        UserResponseDto profile = userService.getCurrentUserProfile(email);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/doctors/search")
    @Operation(summary = "Tìm kiếm bác sĩ với bộ lọc")
    public ResponseEntity<Page<UserResponseDto>> searchDoctors(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) BigDecimal maxFee,
            Pageable pageable) {
        Page<UserResponseDto> doctors = userService.searchDoctors(keyword, specialization, minRating, maxFee, pageable);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/doctors/specializations")
    @Operation(summary = "Lấy danh sách chuyên khoa")
    public ResponseEntity<List<String>> getSpecializations() {
        List<String> specializations = userService.getSpecializations();
        return ResponseEntity.ok(specializations);
    }
}
