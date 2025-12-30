package com.clinicbooking.userservice.dto.familymember;

import com.clinicbooking.userservice.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class FamilyMemberCreateDto {

    @NotNull(message = "User ID không được để trống")
    private Long userId;

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @NotNull(message = "Ngày sinh không được để trống")
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
