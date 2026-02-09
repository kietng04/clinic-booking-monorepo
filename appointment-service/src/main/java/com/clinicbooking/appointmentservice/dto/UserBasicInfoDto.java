package com.clinicbooking.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * Minimal user payload for internal service-to-service calls.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBasicInfoDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private LocalDate dateOfBirth;
    private String gender; // Enum name (MALE/FEMALE/OTHER)
}

