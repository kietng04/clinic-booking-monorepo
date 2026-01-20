package com.clinicbooking.userservice.dto.familymember;

import com.clinicbooking.userservice.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO để cập nhật thành viên gia đình")
public class FamilyMemberUpdateDto {

    @Size(min = 2, max = 255, message = "Họ tên phải có độ dài từ 2 đến 255 ký tự")
    @Schema(description = "Họ và tên đầy đủ", example = "Nguyễn Văn A")
    private String fullName;

    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    @Schema(description = "Ngày sinh", example = "2000-01-15")
    private LocalDate dateOfBirth;

    @Schema(description = "Giới tính", example = "MALE")
    private User.Gender gender;

    @Size(max = 50, message = "Mối quan hệ phải có độ dài tối đa 50 ký tự")
    @Schema(description = "Mối quan hệ với người dùng", example = "Cha")
    private String relationship;

    @Size(max = 10, message = "Nhóm máu phải có độ dài tối đa 10 ký tự")
    @Schema(description = "Nhóm máu", example = "O+")
    private String bloodType;

    @DecimalMin(value = "0.0", inclusive = false, message = "Chiều cao phải lớn hơn 0")
    @Schema(description = "Chiều cao (cm)", example = "170.5")
    private BigDecimal height;

    @DecimalMin(value = "0.0", inclusive = false, message = "Cân nặng phải lớn hơn 0")
    @Schema(description = "Cân nặng (kg)", example = "65.5")
    private BigDecimal weight;

    @Size(max = 500, message = "Thông tin dị ứng phải có độ dài tối đa 500 ký tự")
    @Schema(description = "Thông tin dị ứng", example = "Dị ứng với Penicillin")
    private String allergies;

    @Size(max = 500, message = "Thông tin bệnh mãn tính phải có độ dài tối đa 500 ký tự")
    @Schema(description = "Thông tin bệnh mãn tính", example = "Tiểu đường loại 2")
    private String chronicDiseases;

    @Size(max = 500, message = "URL avatar phải có độ dài tối đa 500 ký tự")
    @Schema(description = "URL avatar", example = "https://example.com/avatar.jpg")
    private String avatarUrl;
}
