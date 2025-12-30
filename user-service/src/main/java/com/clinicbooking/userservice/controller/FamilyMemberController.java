package com.clinicbooking.userservice.controller;

import com.clinicbooking.userservice.dto.familymember.FamilyMemberCreateDto;
import com.clinicbooking.userservice.dto.familymember.FamilyMemberResponseDto;
import com.clinicbooking.userservice.dto.familymember.FamilyMemberUpdateDto;
import com.clinicbooking.userservice.service.FamilyMemberService;
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
@RequestMapping("/api/family-members")
@RequiredArgsConstructor
@Tag(name = "Family Members", description = "API quản lý thành viên gia đình")
@SecurityRequirement(name = "bearerAuth")
public class FamilyMemberController {

    private final FamilyMemberService familyMemberService;

    @PostMapping
    @Operation(summary = "Tạo thành viên gia đình mới")
    public ResponseEntity<FamilyMemberResponseDto> createFamilyMember(
            @Valid @RequestBody FamilyMemberCreateDto dto) {
        FamilyMemberResponseDto response = familyMemberService.createFamilyMember(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin thành viên gia đình theo ID")
    public ResponseEntity<FamilyMemberResponseDto> getFamilyMemberById(@PathVariable Long id) {
        FamilyMemberResponseDto response = familyMemberService.getFamilyMemberById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Lấy danh sách thành viên gia đình của một user")
    public ResponseEntity<List<FamilyMemberResponseDto>> getFamilyMembersByUserId(@PathVariable Long userId) {
        List<FamilyMemberResponseDto> response = familyMemberService.getFamilyMembersByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Lấy tất cả thành viên gia đình")
    public ResponseEntity<Page<FamilyMemberResponseDto>> getAllFamilyMembers(Pageable pageable) {
        Page<FamilyMemberResponseDto> response = familyMemberService.getAllFamilyMembers(pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin thành viên gia đình")
    public ResponseEntity<FamilyMemberResponseDto> updateFamilyMember(
            @PathVariable Long id,
            @Valid @RequestBody FamilyMemberUpdateDto dto) {
        FamilyMemberResponseDto response = familyMemberService.updateFamilyMember(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa thành viên gia đình")
    public ResponseEntity<Void> deleteFamilyMember(@PathVariable Long id) {
        familyMemberService.deleteFamilyMember(id);
        return ResponseEntity.noContent().build();
    }
}
