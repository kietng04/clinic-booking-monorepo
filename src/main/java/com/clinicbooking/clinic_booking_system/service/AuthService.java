package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.user.LoginRequest;
import com.clinicbooking.clinic_booking_system.dto.user.LoginResponse;
import com.clinicbooking.clinic_booking_system.dto.user.RegisterRequest;

public interface AuthService {

    /**
     * Register a new user
     * @param registerRequest containing user details
     * @return LoginResponse with user info and token
     */
    LoginResponse register(RegisterRequest registerRequest);

    /**
     * Login user with email and password
     * @param loginRequest containing email and password
     * @return LoginResponse with user info and token
     */
    LoginResponse login(LoginRequest loginRequest);

    /**
     * Refresh access token using refresh token
     * @param refreshToken the refresh token
     * @return LoginResponse with new access token
     */
    LoginResponse refreshToken(String refreshToken);
}
