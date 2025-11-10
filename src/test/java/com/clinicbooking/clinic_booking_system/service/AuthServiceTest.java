package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.user.LoginRequest;
import com.clinicbooking.clinic_booking_system.dto.user.LoginResponse;
import com.clinicbooking.clinic_booking_system.dto.user.RegisterRequest;
import com.clinicbooking.clinic_booking_system.entity.User;
import com.clinicbooking.clinic_booking_system.exception.BadRequestException;
import com.clinicbooking.clinic_booking_system.repository.UserRepository;
import com.clinicbooking.clinic_booking_system.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;
    private LoginRequest validLoginRequest;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("patient@example.com")
                .password("encodedPassword123")
                .fullName("Nguyễn Văn A")
                .role(User.UserRole.PATIENT)
                .isActive(true)
                .emailVerified(true)
                .phoneVerified(false)
                .createdAt(LocalDateTime.now())
                .build();

        validLoginRequest = LoginRequest.builder()
                .email("patient@example.com")
                .password("rawPassword123")
                .build();

        registerRequest = RegisterRequest.builder()
                .email("newuser@example.com")
                .password("password123")
                .fullName("New User")
                .role(User.UserRole.PATIENT)
                .build();
    }

    @Nested
    @DisplayName("Login Tests")
    class LoginTests {

        @Test
        @DisplayName("Should login successfully with valid email and password")
        void testLogin_Success_WithValidCredentials() {
            when(userRepository.findByEmail(validLoginRequest.getEmail()))
                    .thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("rawPassword123", testUser.getPassword()))
                    .thenReturn(true);
            when(jwtService.generateToken(any(), anyString(), anyString()))
                    .thenReturn("accessToken");
            when(jwtService.generateRefreshToken(any(), anyString()))
                    .thenReturn("refreshToken");

            LoginResponse response = authService.login(validLoginRequest);

            assertNotNull(response);
            assertEquals(1L, response.getUserId());
            assertEquals("patient@example.com", response.getEmail());
            assertEquals("Nguyễn Văn A", response.getFullName());
            assertEquals("PATIENT", response.getRole());
            assertEquals("accessToken", response.getToken());
            assertEquals("refreshToken", response.getRefreshToken());
            assertTrue(response.isEmailVerified());
            assertFalse(response.isPhoneVerified());
        }

        @Test
        @DisplayName("Should throw BadRequestException when user email not found")
        void testLogin_Fail_UserNotFound() {
            when(userRepository.findByEmail(validLoginRequest.getEmail()))
                    .thenReturn(Optional.empty());

            assertThrows(BadRequestException.class, () -> authService.login(validLoginRequest));
        }

        @Test
        @DisplayName("Should throw BadRequestException when password is incorrect")
        void testLogin_Fail_WrongPassword() {
            when(userRepository.findByEmail(validLoginRequest.getEmail()))
                    .thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("rawPassword123", testUser.getPassword()))
                    .thenReturn(false);

            assertThrows(BadRequestException.class, () -> authService.login(validLoginRequest));
        }

        @Test
        @DisplayName("Should throw BadRequestException when user account is inactive")
        void testLogin_Fail_UserInactive() {
            testUser.setIsActive(false);
            when(userRepository.findByEmail(validLoginRequest.getEmail()))
                    .thenReturn(Optional.of(testUser));

            assertThrows(BadRequestException.class, () -> authService.login(validLoginRequest));
        }

        @Test
        @DisplayName("Should login doctor successfully and return DOCTOR role")
        void testLogin_Success_DoctorUser() {
            User doctorUser = User.builder()
                    .id(2L)
                    .email("doctor@example.com")
                    .password("encodedPassword456")
                    .fullName("Bác sĩ Trần Văn B")
                    .role(User.UserRole.DOCTOR)
                    .isActive(true)
                    .emailVerified(true)
                    .phoneVerified(true)
                    .build();

            LoginRequest doctorLoginRequest = LoginRequest.builder()
                    .email("doctor@example.com")
                    .password("rawPassword456")
                    .build();

            when(userRepository.findByEmail(doctorLoginRequest.getEmail()))
                    .thenReturn(Optional.of(doctorUser));
            when(passwordEncoder.matches("rawPassword456", doctorUser.getPassword()))
                    .thenReturn(true);
            when(jwtService.generateToken(any(), anyString(), anyString()))
                    .thenReturn("doctorAccessToken");
            when(jwtService.generateRefreshToken(any(), anyString()))
                    .thenReturn("doctorRefreshToken");

            LoginResponse response = authService.login(doctorLoginRequest);

            assertNotNull(response);
            assertEquals(2L, response.getUserId());
            assertEquals("DOCTOR", response.getRole());
            assertNotNull(response.getToken());
        }
    }

    @Nested
    @DisplayName("Register Tests")
    class RegisterTests {

        @Test
        @DisplayName("Should register new user successfully")
        void testRegister_Success() {
            when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
            when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User user = invocation.getArgument(0);
                user.setId(1L);
                return user;
            });
            when(jwtService.generateToken(any(), anyString(), anyString())).thenReturn("accessToken");
            when(jwtService.generateRefreshToken(any(), anyString())).thenReturn("refreshToken");

            LoginResponse response = authService.register(registerRequest);

            assertNotNull(response);
            assertEquals(registerRequest.getEmail(), response.getEmail());
            assertEquals(registerRequest.getFullName(), response.getFullName());
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when email already exists")
        void testRegister_Fail_EmailExists() {
            when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

            assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when doctor missing specialization")
        void testRegister_Fail_DoctorMissingSpecialization() {
            registerRequest.setRole(User.UserRole.DOCTOR);
            when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);

            assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        }
    }

    @Nested
    @DisplayName("Refresh Token Tests")
    class RefreshTokenTests {

        @Test
        @DisplayName("Should refresh token successfully")
        void testRefreshToken_Success() {
            String refreshToken = "validRefreshToken";
            when(jwtService.isTokenValid(refreshToken)).thenReturn(true);
            when(jwtService.extractUsername(refreshToken)).thenReturn(testUser.getEmail());
            when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
            when(jwtService.generateToken(any(), anyString(), anyString())).thenReturn("newAccessToken");

            LoginResponse response = authService.refreshToken(refreshToken);

            assertNotNull(response);
            assertEquals("newAccessToken", response.getToken());
        }

        @Test
        @DisplayName("Should throw exception when refresh token is invalid")
        void testRefreshToken_Fail_InvalidToken() {
            String invalidToken = "invalidToken";
            when(jwtService.isTokenValid(invalidToken)).thenReturn(false);

            assertThrows(BadRequestException.class, () -> authService.refreshToken(invalidToken));
        }
    }
}
