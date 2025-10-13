package com.clinicbooking.userservice.dto.user;

import com.clinicbooking.userservice.entity.User;
import jakarta.validation.constraints.Email;
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
public class UserUpdateDto {

    @Email(message = "Email không hợp lệ")
    private String email;

    private String phone;
    private String fullName;
    private LocalDate dateOfBirth;
    private User.Gender gender;
    private String avatarUrl;

    // Doctor specific fields
    private String specialization;
    private String licenseNumber;
    private String workplace;
    private Integer experienceYears;
    private BigDecimal consultationFee;
}
