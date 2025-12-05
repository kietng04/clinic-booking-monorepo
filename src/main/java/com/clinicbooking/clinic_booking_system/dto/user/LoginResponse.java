package com.clinicbooking.clinic_booking_system.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private Long userId;

    private String email;

    private String fullName;

    private String role;

    private String token;

    private String refreshToken;

    private boolean emailVerified;

    private boolean phoneVerified;
}

