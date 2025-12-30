package com.clinicbooking.userservice.dto.familymember;

import com.clinicbooking.userservice.entity.User;
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
public class FamilyMemberUpdateDto {

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
}
