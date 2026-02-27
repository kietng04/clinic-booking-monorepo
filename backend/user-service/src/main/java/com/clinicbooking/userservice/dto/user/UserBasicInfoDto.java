package com.clinicbooking.userservice.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Minimal user payload for internal service-to-service calls.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBasicInfoDto {
    private Long id;
    private LocalDate dateOfBirth;
    private String gender; // Enum name (MALE/FEMALE/OTHER) for compatibility across services
}

