package com.clinicbooking.userservice.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private Long userId;
    private String email;
    private String fullName;
    private String role;
    private String token;
    private String refreshToken;
    private boolean emailVerified;
    private boolean phoneVerified;
}
