package com.clinicbooking.consultationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user information from User Service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoDto {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String specialization;
    private Boolean isActive;
    private String avatar;
}
