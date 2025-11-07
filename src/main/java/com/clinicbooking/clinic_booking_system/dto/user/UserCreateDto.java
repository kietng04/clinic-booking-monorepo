package com.clinicbooking.clinic_booking_system.dto.user;

import com.clinicbooking.clinic_booking_system.entity.User;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateDto {
    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    private String email;

    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String password;

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    private LocalDate dateOfBirth;
    private User.Gender gender;

    @NotNull(message = "Vai trò không được để trống")
    private User.UserRole role;

    private String avatarUrl;

    // Doctor-specific fields
    private String specialization;
    private String licenseNumber;
    private String workplace;
    private Integer experienceYears;
    private BigDecimal consultationFee;
}
