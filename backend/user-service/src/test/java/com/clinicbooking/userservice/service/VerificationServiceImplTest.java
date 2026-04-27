package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.entity.VerificationCode;
import com.clinicbooking.userservice.exception.ValidationException;
import com.clinicbooking.userservice.repository.UserRepository;
import com.clinicbooking.userservice.repository.VerificationCodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VerificationServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private VerificationCodeRepository verificationCodeRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private SmsService smsService;

    @InjectMocks
    private VerificationServiceImpl verificationService;

    private User testUser;
    private VerificationCode emailCode;
    private VerificationCode smsCode;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(verificationService, "frontendUrl", "https://frontend.example");

        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("password")
                .fullName("Test User")
                .phone("0901234567")
                .role(User.UserRole.PATIENT)
                .emailVerified(false)
                .phoneVerified(false)
                .isActive(true)
                .build();

        emailCode = VerificationCode.builder()
                .id(1L)
                .userId(1L)
                .type(VerificationCode.VerificationType.EMAIL)
                .code("token-123")
                .expiryDate(LocalDateTime.now().plusHours(1))
                .isVerified(false)
                .attemptCount(0)
                .build();

        smsCode = VerificationCode.builder()
                .id(2L)
                .userId(1L)
                .type(VerificationCode.VerificationType.SMS)
                .code("123456")
                .expiryDate(LocalDateTime.now().plusMinutes(30))
                .isVerified(false)
                .attemptCount(0)
                .build();
    }

    @Test
    void sendEmailVerification_withValidUser_sendsEmail() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(verificationCodeRepository.save(any(VerificationCode.class))).thenReturn(emailCode);

        // Act
        verificationService.sendEmailVerification(1L);

        // Assert
        ArgumentCaptor<VerificationCode> codeCaptor = ArgumentCaptor.forClass(VerificationCode.class);
        verify(verificationCodeRepository).save(codeCaptor.capture());
        VerificationCode savedCode = codeCaptor.getValue();

        assertThat(savedCode.getUserId()).isEqualTo(1L);
        assertThat(savedCode.getType()).isEqualTo(VerificationCode.VerificationType.EMAIL);
        assertThat(savedCode.getCode()).isNotNull();

        verify(emailService).sendVerificationEmail(
                eq("test@example.com"),
                eq("https://frontend.example/verify-email?token=" + savedCode.getCode())
        );
    }

    @Test
    void sendEmailVerification_withNonExistentUser_throwsException() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> verificationService.sendEmailVerification(999L))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Người dùng không tìm thấy");

        verify(verificationCodeRepository, never()).save(any());
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString());
    }

    @Test
    void sendEmailVerification_withAlreadyVerifiedEmail_throwsException() {
        // Arrange
        testUser.setEmailVerified(true);
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThatThrownBy(() -> verificationService.sendEmailVerification(1L))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Email đã được xác minh");

        verify(verificationCodeRepository, never()).save(any());
    }

    @Test
    void sendSmsVerification_withValidPhone_sendsSms() {
        // Arrange
        when(verificationCodeRepository.save(any(VerificationCode.class))).thenReturn(smsCode);

        // Act
        verificationService.sendSmsVerification(1L, "0901234567");

        // Assert
        ArgumentCaptor<VerificationCode> codeCaptor = ArgumentCaptor.forClass(VerificationCode.class);
        verify(verificationCodeRepository).save(codeCaptor.capture());
        VerificationCode savedCode = codeCaptor.getValue();

        assertThat(savedCode.getUserId()).isEqualTo(1L);
        assertThat(savedCode.getType()).isEqualTo(VerificationCode.VerificationType.SMS);
        assertThat(savedCode.getCode()).hasSize(6);
        assertThat(savedCode.getCode()).matches("\\d{6}");

        verify(smsService).sendVerificationSms(eq("0901234567"), anyString());
    }

    @Test
    void verifyEmail_withValidToken_verifiesEmail() {
        // Arrange
        when(verificationCodeRepository.findByCodeAndType("token-123", VerificationCode.VerificationType.EMAIL))
                .thenReturn(Optional.of(emailCode));
        when(verificationCodeRepository.save(any(VerificationCode.class))).thenReturn(emailCode);
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        boolean result = verificationService.verifyEmail("token-123");

        // Assert
        assertThat(result).isTrue();
        verify(verificationCodeRepository).save(any(VerificationCode.class));
        verify(userRepository).save(testUser);
        assertThat(testUser.getEmailVerified()).isTrue();
    }

    @Test
    void verifyEmail_withExpiredToken_returnsFalse() {
        // Arrange
        emailCode.setExpiryDate(LocalDateTime.now().minusHours(1));
        when(verificationCodeRepository.findByCodeAndType("token-123", VerificationCode.VerificationType.EMAIL))
                .thenReturn(Optional.of(emailCode));

        // Act
        boolean result = verificationService.verifyEmail("token-123");

        // Assert
        assertThat(result).isFalse();
        verify(verificationCodeRepository, never()).save(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void verifyEmail_withAlreadyVerifiedToken_returnsFalse() {
        // Arrange
        emailCode.setIsVerified(true);
        when(verificationCodeRepository.findByCodeAndType("token-123", VerificationCode.VerificationType.EMAIL))
                .thenReturn(Optional.of(emailCode));

        // Act
        boolean result = verificationService.verifyEmail("token-123");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    void verifyEmail_withInvalidToken_returnsFalse() {
        // Arrange
        when(verificationCodeRepository.findByCodeAndType("invalid-token", VerificationCode.VerificationType.EMAIL))
                .thenReturn(Optional.empty());

        // Act
        boolean result = verificationService.verifyEmail("invalid-token");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    void verifySms_withValidCode_verifiesPhone() {
        // Arrange
        when(verificationCodeRepository.findByUserIdAndCode(anyLong(), anyString()))
                .thenReturn(Optional.of(smsCode));
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(verificationCodeRepository.save(any(VerificationCode.class))).thenReturn(smsCode);

        // Act
        boolean result = verificationService.verifySms(1L, "123456");

        // Assert
        assertThat(result).isTrue();
        verify(userRepository).save(testUser);
        assertThat(testUser.getPhoneVerified()).isTrue();
    }

    @Test
    void verifySms_withInvalidCode_throwsException() {
        // Arrange
        when(verificationCodeRepository.findByUserIdAndCode(anyLong(), anyString()))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> verificationService.verifySms(1L, "wrong-code"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Mã xác minh không hợp lệ");
    }

    @Test
    void verifySms_withExpiredCode_throwsException() {
        // Arrange
        smsCode.setExpiryDate(LocalDateTime.now().minusMinutes(1));
        when(verificationCodeRepository.findByUserIdAndCode(anyLong(), anyString()))
                .thenReturn(Optional.of(smsCode));

        // Act & Assert
        assertThatThrownBy(() -> verificationService.verifySms(1L, "123456"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Mã xác minh đã hết hiệu lực");
    }

    @Test
    void verifySms_exceedsMaxAttempts_throwsException() {
        // Arrange
        smsCode.setAttemptCount(5);
        when(verificationCodeRepository.findByUserIdAndCode(anyLong(), anyString()))
                .thenReturn(Optional.of(smsCode));

        // Act & Assert
        assertThatThrownBy(() -> verificationService.verifySms(1L, "123456"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Đã vượt giới hạn số lần thử");
    }

    @Test
    void resendCode_forEmail_sendsNewCode() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(verificationCodeRepository.save(any(VerificationCode.class))).thenReturn(emailCode);

        // Act
        verificationService.resendCode(1L, VerificationCode.VerificationType.EMAIL);

        // Assert
        verify(verificationCodeRepository).save(any(VerificationCode.class));
        verify(emailService).sendVerificationEmail(anyString(), anyString());
    }

    @Test
    void resendCode_forSms_sendsNewCode() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(verificationCodeRepository.save(any(VerificationCode.class))).thenReturn(smsCode);

        // Act
        verificationService.resendCode(1L, VerificationCode.VerificationType.SMS);

        // Assert
        verify(verificationCodeRepository).save(any(VerificationCode.class));
        verify(smsService).sendVerificationSms(anyString(), anyString());
    }

    @Test
    void resendCode_withNonExistentUser_throwsException() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> verificationService.resendCode(999L, VerificationCode.VerificationType.EMAIL))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Người dùng không tìm thấy");
    }
}
