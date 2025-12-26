package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.auth.AuthResponse;
import com.clinicbooking.userservice.dto.auth.LoginRequest;
import com.clinicbooking.userservice.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
}
