package com.clinicbooking.userservice.dto.familymember;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO phản hồi cho thành viên gia đình")
public class FamilyMemberResponseDto {

    @Schema(description = "ID của thành viên gia đình", example = "1")
    private Long id;

    @Schema(description = "ID của người dùng sở hữu", example = "1")
    private Long userId;

    @Schema(description = "Họ và tên đầy đủ", example = "Nguyễn Văn A")
    private String fullName;

    @Schema(description = "Ngày sinh", example = "2000-01-15")
    private LocalDate dateOfBirth;

    @Schema(description = "Giới tính", example = "MALE")
    private String gender;

    @Schema(description = "Mối quan hệ với người dùng", example = "Cha")
    private String relationship;

    @Schema(description = "Nhóm máu", example = "O+")
    private String bloodType;

    @Schema(description = "Chiều cao (cm)", example = "170.5")
    private BigDecimal height;

    @Schema(description = "Cân nặng (kg)", example = "65.5")
    private BigDecimal weight;

    @Schema(description = "Thông tin dị ứng", example = "Dị ứng với Penicillin")
    private String allergies;

    @Schema(description = "Thông tin bệnh mãn tính", example = "Tiểu đường loại 2")
    private String chronicDiseases;

    @Schema(description = "URL avatar", example = "https://example.com/avatar.jpg")
    private String avatarUrl;

    @Schema(description = "Tuổi (được tính toán từ ngày sinh)", example = "24")
    private Integer age;

    @Schema(description = "Chỉ số BMI (được tính toán từ chiều cao và cân nặng)", example = "22.5")
    private BigDecimal bmi;

    @Schema(description = "Ngày tạo", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Ngày cập nhật cuối cùng", example = "2024-01-20T14:45:30")
    private LocalDateTime updatedAt;
}
