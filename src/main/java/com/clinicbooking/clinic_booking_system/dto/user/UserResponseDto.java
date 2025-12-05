package com.clinicbooking.clinic_booking_system.dto.user;

import com.clinicbooking.clinic_booking_system.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String email;
    private String phone;
    private String fullName;
    private LocalDate dateOfBirth;
    private User.Gender gender;
    private User.UserRole role;
    private String avatarUrl;
    private Boolean isActive;
    private Boolean emailVerified;
    private Boolean phoneVerified;

    // Doctor-specific
    private String specialization;
    private String licenseNumber;
    private String workplace;
    private Integer experienceYears;
    private BigDecimal rating;
    private BigDecimal consultationFee;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    private Integer age;
}
