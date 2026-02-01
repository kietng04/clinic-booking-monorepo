package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.entity.VerificationCode;

public interface VerificationService {
    void sendEmailVerification(Long userId);
    void sendSmsVerification(Long userId, String phone);
    boolean verifyEmail(String token);
    boolean verifySms(Long userId, String code);
    void resendCode(Long userId, VerificationCode.VerificationType type);
}
