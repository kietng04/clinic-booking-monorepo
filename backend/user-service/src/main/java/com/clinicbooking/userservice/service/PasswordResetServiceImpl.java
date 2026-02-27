package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.entity.PasswordResetToken;
import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.exception.ValidationException;
import com.clinicbooking.userservice.repository.PasswordResetTokenRepository;
import com.clinicbooking.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final long TOKEN_EXPIRY_HOURS = 24;
    private static final String FRONTEND_URL = "http://localhost:5173";

    @Override
    @Transactional
    public void initiateReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            // Return silently to avoid revealing registered emails
            log.info("Password reset requested for non-existent email: {}", email);
            return;
        }

        // Invalidate existing tokens
        tokenRepository.findByUserIdAndIsUsedFalse(user.getId())
                .ifPresent(token -> {
                    token.setIsUsed(true);
                    tokenRepository.save(token);
                });

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .userId(user.getId())
                .token(token)
                .expiryDate(LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS))
                .isUsed(false)
                .build();
        tokenRepository.save(resetToken);

        String resetLink = FRONTEND_URL + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
        log.info("Password reset token generated for user: {}", user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateToken(String token) {
        return tokenRepository.findByToken(token)
                .map(t -> !t.getIsUsed() && t.getExpiryDate().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ValidationException("Token không hợp lệ"));

        if (resetToken.getIsUsed()) {
            throw new ValidationException("Token đã được sử dụng");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ValidationException("Token đã hết hiệu lực");
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new ValidationException("Người dùng không tìm thấy"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setIsUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password reset successfully for user: {}", user.getId());
    }
}
