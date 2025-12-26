package com.clinicbooking.userservice.dto.user;

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
public class UserResponseDto {
    private Long id;
    private String email;
    private String phone;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String role;
    private String avatarUrl;
    private Boolean isActive;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private String specialization;
    private String licenseNumber;
    private String workplace;
    private Integer experienceYears;
    private BigDecimal rating;
    private BigDecimal consultationFee;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
