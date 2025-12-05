package com.clinicbooking.clinic_booking_system.dto.familymember;

import com.clinicbooking.clinic_booking_system.entity.User;
import jakarta.validation.constraints.DecimalMin;
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
public class FamilyMemberUpdateDto {
    private String fullName;
    private LocalDate dateOfBirth;
    private User.Gender gender;
    private String relationship;
    private String bloodType;
    @DecimalMin(value = "0.0")
    private BigDecimal height;
    @DecimalMin(value = "0.0")
    private BigDecimal weight;
    private String allergies;
    private String chronicDiseases;
    private String avatarUrl;
}
