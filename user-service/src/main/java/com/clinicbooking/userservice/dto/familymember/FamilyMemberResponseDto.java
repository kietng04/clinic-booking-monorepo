package com.clinicbooking.userservice.dto.familymember;

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
public class FamilyMemberResponseDto {
    private Long id;
    private Long userId;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String relationship;
    private String bloodType;
    private BigDecimal height;
    private BigDecimal weight;
    private String allergies;
    private String chronicDiseases;
    private String avatarUrl;
    private Integer age;
    private BigDecimal bmi;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
