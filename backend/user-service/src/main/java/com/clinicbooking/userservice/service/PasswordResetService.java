package com.clinicbooking.userservice.service;

public interface PasswordResetService {
    void initiateReset(String email);
    boolean validateToken(String token);
    void resetPassword(String token, String newPassword);
}
