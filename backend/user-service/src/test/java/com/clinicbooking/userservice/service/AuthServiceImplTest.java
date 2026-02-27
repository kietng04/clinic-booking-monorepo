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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserEventPublisher eventPublisher;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest patientRegisterRequest;
    private RegisterRequest doctorRegisterRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        patientRegisterRequest = RegisterRequest.builder()
                .email("patient@test.com")
                .password("password123")
                .fullName("John Doe")
                .phone("0901234567")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender(User.Gender.MALE)
                .role(User.UserRole.PATIENT)
                .build();

        doctorRegisterRequest = RegisterRequest.builder()
                .email("doctor@test.com")
                .password("password123")
                .fullName("Dr. Smith")
                .phone("0901234568")
                .role(User.UserRole.DOCTOR)
                .specialization("Cardiology")
                .licenseNumber("LIC123")
                .workplace("City Hospital")
                .experienceYears(10)
                .consultationFee(BigDecimal.valueOf(500000))
                .build();

        loginRequest = LoginRequest.builder()
                .email("patient@test.com")
                .password("password123")
                .build();

        testUser = User.builder()
                .id(1L)
                .email("patient@test.com")
                .password("encodedPassword")
                .fullName("John Doe")
                .role(User.UserRole.PATIENT)
                .isActive(true)
                .emailVerified(false)
                .phoneVerified(false)
                .build();
    }

    @Test
    void register_withValidPatientRequest_createsUser() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(anyLong(), anyString(), anyString())).thenReturn("token");
        when(jwtService.generateRefreshToken(anyLong(), anyString())).thenReturn("refreshToken");

        // Act
        AuthResponse response = authService.register(patientRegisterRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("patient@test.com");
        assertThat(response.getToken()).isEqualTo("token");
        assertThat(response.getRefreshToken()).isEqualTo("refreshToken");

        verify(userRepository).save(any(User.class));
        verify(eventPublisher).publishUserCreated(any(User.class));
    }

    @Test
    void register_withValidDoctorRequest_createsDoctor() {
        // Arrange
        User doctorUser = User.builder()
                .id(2L)
                .email("doctor@test.com")
                .password("encodedPassword")
                .fullName("Dr. Smith")
                .role(User.UserRole.DOCTOR)
                .specialization("Cardiology")
                .licenseNumber("LIC123")
                .isActive(true)
                .emailVerified(false)
                .phoneVerified(false)
                .build();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(doctorUser);
        when(jwtService.generateToken(anyLong(), anyString(), anyString())).thenReturn("token");
        when(jwtService.generateRefreshToken(anyLong(), anyString())).thenReturn("refreshToken");

        // Act
        AuthResponse response = authService.register(doctorRegisterRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getRole()).isEqualTo("DOCTOR");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getSpecialization()).isEqualTo("Cardiology");
        assertThat(savedUser.getLicenseNumber()).isEqualTo("LIC123");
    }

    @Test
    void register_withDuplicateEmail_throwsException() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(patientRegisterRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email đã tồn tại");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_withDuplicatePhone_throwsException() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(patientRegisterRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Số điện thoại đã tồn tại");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_doctorWithoutSpecialization_throwsException() {
        // Arrange
        doctorRegisterRequest.setSpecialization(null);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(doctorRegisterRequest))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Chuyên khoa không được để trống");
    }

    @Test
    void register_doctorWithoutLicenseNumber_setsPendingLicense() {
        // Arrange
        doctorRegisterRequest.setLicenseNumber(null);
        User doctorUser = User.builder()
                .id(2L)
                .email("doctor@test.com")
                .password("encodedPassword")
                .fullName("Dr. Smith")
                .role(User.UserRole.DOCTOR)
                .licenseNumber("PENDING_LICENSE")
                .isActive(true)
                .build();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(doctorUser);
        when(jwtService.generateToken(anyLong(), anyString(), anyString())).thenReturn("token");
        when(jwtService.generateRefreshToken(anyLong(), anyString())).thenReturn("refreshToken");

        // Act
        AuthResponse response = authService.register(doctorRegisterRequest);

        // Assert
        assertThat(response).isNotNull();
        verify(userRepository).save(any(User.class));
    }

    @Test
    void login_withValidCredentials_returnsAuthResponse() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtService.generateToken(anyLong(), anyString(), anyString())).thenReturn("token");
        when(jwtService.generateRefreshToken(anyLong(), anyString())).thenReturn("refreshToken");

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("patient@test.com");
        assertThat(response.getToken()).isEqualTo("token");
        assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
    }

    @Test
    void login_withInvalidEmail_throwsUnauthorizedException() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Email hoặc mật khẩu không đúng");
    }

    @Test
    void login_withInvalidPassword_throwsUnauthorizedException() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Email hoặc mật khẩu không đúng");
    }

    @Test
    void login_withInactiveAccount_throwsUnauthorizedException() {
        // Arrange
        testUser.setIsActive(false);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Tài khoản đã bị khóa");
    }

    @Test
    void refreshToken_withValidToken_returnsNewToken() {
        // Arrange
        String refreshToken = "valid-refresh-token";
        when(jwtService.isTokenValid(anyString())).thenReturn(true);
        when(jwtService.extractUsername(anyString())).thenReturn("patient@test.com");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(anyLong(), anyString(), anyString())).thenReturn("new-token");

        // Act
        AuthResponse response = authService.refreshToken(refreshToken);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("new-token");
        assertThat(response.getRefreshToken()).isEqualTo(refreshToken);
    }

    @Test
    void refreshToken_withInvalidToken_throwsException() {
        // Arrange
        when(jwtService.isTokenValid(anyString())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken("invalid-token"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Refresh token không hợp lệ");
    }

    @Test
    void refreshToken_withNonExistentUser_throwsException() {
        // Arrange
        when(jwtService.isTokenValid(anyString())).thenReturn(true);
        when(jwtService.extractUsername(anyString())).thenReturn("nonexistent@test.com");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken("valid-token"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User không tồn tại");
    }
}
