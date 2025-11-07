package com.clinicbooking.clinic_booking_system.dto.familymember;

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
public class FamilyMemberResponseDto {
    private Long id;
    private Long userId;
    private String userFullName;
    private String fullName;
    private LocalDate dateOfBirth;
    private User.Gender gender;
    private String relationship;
    private String bloodType;
    private BigDecimal height;
    private BigDecimal weight;
    private String allergies;
    private String chronicDiseases;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    private Integer age;
    private BigDecimal bmi;
}
