package com.clinicbooking.userservice.controller;

import com.clinicbooking.userservice.dto.familymember.FamilyMemberCreateDto;
import com.clinicbooking.userservice.dto.familymember.FamilyMemberResponseDto;
import com.clinicbooking.userservice.dto.familymember.FamilyMemberUpdateDto;
import com.clinicbooking.userservice.service.FamilyMemberService;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/family-members")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Family Members", description = "API quản lý thành viên gia đình của người dùng")
@SecurityRequirement(name = "bearerAuth")
public class FamilyMemberController {

    private final FamilyMemberService familyMemberService;

    @PostMapping
    @Operation(summary = "Tạo thành viên gia đình mới",
            description = "Tạo một bản ghi thành viên gia đình mới cho người dùng được chỉ định")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Thành viên gia đình được tạo thành công",
                    content = @Content(schema = @Schema(implementation = FamilyMemberResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng"),
            @ApiResponse(responseCode = "401", description = "Không được xác thực")
    })
    public ResponseEntity<FamilyMemberResponseDto> createFamilyMember(
            @Valid @RequestBody FamilyMemberCreateDto dto) {
        log.info("Creating family member for user ID: {}", dto.getUserId());
        FamilyMemberResponseDto response = familyMemberService.createFamilyMember(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin thành viên gia đình theo ID",
            description = "Truy xuất chi tiết của một thành viên gia đình cụ thể theo ID của họ")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Thành viên gia đình được tìm thấy",
                    content = @Content(schema = @Schema(implementation = FamilyMemberResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy thành viên gia đình"),
            @ApiResponse(responseCode = "401", description = "Không được xác thực")
    })
    public ResponseEntity<FamilyMemberResponseDto> getFamilyMemberById(
            @Parameter(description = "ID của thành viên gia đình", required = true)
            @PathVariable Long id) {
        log.info("Fetching family member with ID: {}", id);
        FamilyMemberResponseDto response = familyMemberService.getFamilyMemberById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Lấy danh sách thành viên gia đình của một người dùng",
            description = "Truy xuất tất cả các thành viên gia đình không bị xóa của một người dùng cụ thể")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Danh sách thành viên gia đình được truy xuất thành công",
                    content = @Content(schema = @Schema(implementation = FamilyMemberResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng"),
            @ApiResponse(responseCode = "401", description = "Không được xác thực")
    })
    public ResponseEntity<List<FamilyMemberResponseDto>> getFamilyMembersByUserId(
            @Parameter(description = "ID của người dùng", required = true)
            @PathVariable Long userId) {
        log.info("Fetching family members for user ID: {}", userId);
        List<FamilyMemberResponseDto> response = familyMemberService.getFamilyMembersByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Lấy tất cả thành viên gia đình với phân trang",
            description = "Truy xuất danh sách tất cả các thành viên gia đình với hỗ trợ phân trang và sắp xếp")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Danh sách thành viên gia đình được truy xuất thành công",
                    content = @Content(schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "400", description = "Tham số phân trang không hợp lệ"),
            @ApiResponse(responseCode = "401", description = "Không được xác thực")
    })
    public ResponseEntity<Page<FamilyMemberResponseDto>> getAllFamilyMembers(
            @Parameter(description = "Phân trang và sắp xếp")
            Pageable pageable) {
        log.info("Fetching all family members with pagination");
        Page<FamilyMemberResponseDto> response = familyMemberService.getAllFamilyMembers(pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin thành viên gia đình",
            description = "Cập nhật thông tin chi tiết của một thành viên gia đình cụ thể")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Thành viên gia đình được cập nhật thành công",
                    content = @Content(schema = @Schema(implementation = FamilyMemberResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy thành viên gia đình"),
            @ApiResponse(responseCode = "401", description = "Không được xác thực")
    })
    public ResponseEntity<FamilyMemberResponseDto> updateFamilyMember(
            @Parameter(description = "ID của thành viên gia đình", required = true)
            @PathVariable Long id,
            @Valid @RequestBody FamilyMemberUpdateDto dto) {
        log.info("Updating family member with ID: {}", id);
        FamilyMemberResponseDto response = familyMemberService.updateFamilyMember(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa thành viên gia đình",
            description = "Xóa mềm (soft delete) một thành viên gia đình - đánh dấu là đã xóa mà không xóa vật lý")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Thành viên gia đình được xóa thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy thành viên gia đình"),
            @ApiResponse(responseCode = "401", description = "Không được xác thực")
    })
    public ResponseEntity<Void> deleteFamilyMember(
            @Parameter(description = "ID của thành viên gia đình", required = true)
            @PathVariable Long id) {
        log.info("Soft deleting family member with ID: {}", id);
        familyMemberService.deleteFamilyMember(id);
        return ResponseEntity.noContent().build();
    }
}
