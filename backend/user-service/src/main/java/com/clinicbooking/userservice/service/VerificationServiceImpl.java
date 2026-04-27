package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.entity.VerificationCode;
import com.clinicbooking.userservice.exception.ValidationException;
import com.clinicbooking.userservice.repository.UserRepository;
import com.clinicbooking.userservice.repository.VerificationCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationServiceImpl implements VerificationService {

    private final UserRepository userRepository;
    private final VerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private static final long CODE_EXPIRY_MINUTES = 30;
    private static final int MAX_ATTEMPTS = 5;

    @Override
    @Transactional
    public void sendEmailVerification(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ValidationException("Người dùng không tìm thấy"));

        if (user.getEmailVerified()) {
            throw new ValidationException("Email đã được xác minh");
        }

        String token = UUID.randomUUID().toString();
        VerificationCode code = VerificationCode.builder()
                .userId(userId)
                .type(VerificationCode.VerificationType.EMAIL)
                .code(token)
                .expiryDate(LocalDateTime.now().plusMinutes(CODE_EXPIRY_MINUTES))
                .isVerified(false)
                .build();
        verificationCodeRepository.save(code);

        String verificationLink = frontendUrl + "/verify-email?token=" + token;
        emailService.sendVerificationEmail(user.getEmail(), verificationLink);
        log.info("Email verification code sent for user: {}", userId);
    }

    @Override
    @Transactional
    public void sendSmsVerification(Long userId, String phone) {
        String code = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 999999));
        VerificationCode verificationCode = VerificationCode.builder()
                .userId(userId)
                .type(VerificationCode.VerificationType.SMS)
                .code(code)
                .expiryDate(LocalDateTime.now().plusMinutes(CODE_EXPIRY_MINUTES))
                .isVerified(false)
                .build();
        verificationCodeRepository.save(verificationCode);

        smsService.sendVerificationSms(phone, code);
        log.info("SMS verification code sent for user: {}", userId);
    }

    @Override
    @Transactional
    public boolean verifyEmail(String token) {
        return verificationCodeRepository.findByCodeAndType(token, VerificationCode.VerificationType.EMAIL)
                .map(this::doVerify)
                .orElse(false);
    }

    private boolean doVerify(VerificationCode code) {
        if (code.getIsVerified()) return false;
        if (code.getExpiryDate().isBefore(LocalDateTime.now())) return false;

        code.setIsVerified(true);
        verificationCodeRepository.save(code);

        User user = userRepository.findById(code.getUserId()).orElse(null);
        if (user != null) {
            if (code.getType() == VerificationCode.VerificationType.EMAIL) {
                user.setEmailVerified(true);
            } else {
                user.setPhoneVerified(true);
            }
            userRepository.save(user);
        }
        return true;
    }

    @Override
    @Transactional
    public boolean verifySms(Long userId, String code) {
        VerificationCode verification = verificationCodeRepository
                .findByUserIdAndCode(userId, code)
                .orElseThrow(() -> new ValidationException("Mã xác minh không hợp lệ"));

        if (verification.getAttemptCount() >= MAX_ATTEMPTS) {
            throw new ValidationException("Đã vượt giới hạn số lần thử");
        }

        verification.setAttemptCount(verification.getAttemptCount() + 1);

        if (verification.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ValidationException("Mã xác minh đã hết hiệu lực");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ValidationException("Người dùng không tìm thấy"));
        user.setPhoneVerified(true);
        userRepository.save(user);

        verification.setIsVerified(true);
        verificationCodeRepository.save(verification);
        return true;
    }

    @Override
    @Transactional
    public void resendCode(Long userId, VerificationCode.VerificationType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ValidationException("Người dùng không tìm thấy"));

        if (type == VerificationCode.VerificationType.EMAIL) {
            sendEmailVerification(userId);
        } else if (type == VerificationCode.VerificationType.SMS) {
            sendSmsVerification(userId, user.getPhone());
        }
    }
}
