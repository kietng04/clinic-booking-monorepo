package com.clinicbooking.clinic_booking_system.dto.user;

import jakarta.validation.constraints.Pattern;
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
public class UserUpdateDto {
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String avatarUrl;

    // Doctor-specific fields
    private String specialization;
    private String workplace;
    private Integer experienceYears;
    private BigDecimal consultationFee;

    // Status fields
    private Boolean isActive;
    private Boolean emailVerified;
    private Boolean phoneVerified;
}
