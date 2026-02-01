package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.auth.AuthResponse;
import com.clinicbooking.userservice.dto.auth.LoginRequest;
import com.clinicbooking.userservice.dto.auth.RegisterRequest;
import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.event.UserEventPublisher;
import com.clinicbooking.userservice.exception.DuplicateResourceException;
import com.clinicbooking.userservice.exception.UnauthorizedException;
import com.clinicbooking.userservice.exception.ValidationException;
import com.clinicbooking.userservice.repository.UserRepository;
import com.clinicbooking.userservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserEventPublisher eventPublisher;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email đã tồn tại");
        }

        // Validate phone uniqueness
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Số điện thoại đã tồn tại");
        }

        // Validate doctor-specific fields
        if (request.getRole() == User.UserRole.DOCTOR) {
            if (request.getSpecialization() == null || request.getSpecialization().isBlank()) {
                throw new ValidationException("Chuyên khoa không được để trống cho bác sĩ");
            }
            if (request.getLicenseNumber() == null || request.getLicenseNumber().isBlank()) {
                // Allow missing license number for now to unblock registration (or generate
                // default)
                log.warn("Doctor missing license number, setting to PENDING_LICENSE");
                request.setLicenseNumber("PENDING_LICENSE");
            }
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .role(request.getRole())
                .specialization(request.getSpecialization())
                .licenseNumber(request.getLicenseNumber())
                .workplace(request.getWorkplace())
                .experienceYears(request.getExperienceYears())
                .consultationFee(request.getConsultationFee())
                .isActive(true)
                .emailVerified(false)
                .phoneVerified(false)
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        // Publish user created event
        eventPublisher.publishUserCreated(user);

        // Generate tokens
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().toString());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().toString())
                .token(token)
                .refreshToken(refreshToken)
                .emailVerified(user.getEmailVerified())
                .phoneVerified(user.getPhoneVerified())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Email hoặc mật khẩu không đúng", "INVALID_CREDENTIALS"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Email hoặc mật khẩu không đúng", "INVALID_CREDENTIALS");
        }

        if (!user.getIsActive()) {
            throw new UnauthorizedException("Tài khoản đã bị khóa", "ACCOUNT_LOCKED");
        }

        log.info("User logged in: {}", user.getEmail());

        // Generate tokens
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().toString());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().toString())
                .token(token)
                .refreshToken(refreshToken)
                .emailVerified(user.getEmailVerified())
                .phoneVerified(user.getPhoneVerified())
                .build();
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new RuntimeException("Refresh token không hợp lệ");
        }

        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        String newToken = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().toString());

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().toString())
                .token(newToken)
                .refreshToken(refreshToken)
                .emailVerified(user.getEmailVerified())
                .phoneVerified(user.getPhoneVerified())
                .build();
    }
}
