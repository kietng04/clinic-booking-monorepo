package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.entity.PasswordResetToken;
import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.exception.ValidationException;
import com.clinicbooking.userservice.repository.PasswordResetTokenRepository;
import com.clinicbooking.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PasswordResetServiceImpl passwordResetService;

    private User testUser;
    private PasswordResetToken validToken;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("oldEncodedPassword")
                .fullName("Test User")
                .role(User.UserRole.PATIENT)
                .isActive(true)
                .build();

        validToken = PasswordResetToken.builder()
                .id(1L)
                .userId(1L)
                .token("valid-token-123")
                .expiryDate(LocalDateTime.now().plusHours(24))
                .isUsed(false)
                .build();
    }

    @Test
    void initiateReset_withExistingEmail_sendsEmail() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(tokenRepository.findByUserIdAndIsUsedFalse(anyLong())).thenReturn(Optional.empty());
        when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(validToken);

        // Act
        passwordResetService.initiateReset("test@example.com");

        // Assert
        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        PasswordResetToken savedToken = tokenCaptor.getValue();

        assertThat(savedToken.getUserId()).isEqualTo(1L);
        assertThat(savedToken.getToken()).isNotNull();
        assertThat(savedToken.getIsUsed()).isFalse();

        verify(emailService).sendPasswordResetEmail(eq("test@example.com"), anyString());
    }

    @Test
    void initiateReset_withNonExistentEmail_returnsSilently() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act
        passwordResetService.initiateReset("nonexistent@example.com");

        // Assert - Should not throw exception or save token
        verify(tokenRepository, never()).save(any());
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
    }

    @Test
    void initiateReset_withExistingUnusedToken_invalidatesOldToken() {
        // Arrange
        PasswordResetToken oldToken = PasswordResetToken.builder()
                .id(2L)
                .userId(1L)
                .token("old-token")
                .expiryDate(LocalDateTime.now().plusHours(1))
                .isUsed(false)
                .build();

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(tokenRepository.findByUserIdAndIsUsedFalse(anyLong())).thenReturn(Optional.of(oldToken));
        when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(oldToken);

        // Act
        passwordResetService.initiateReset("test@example.com");

        // Assert
        verify(tokenRepository, times(2)).save(any(PasswordResetToken.class));
        assertThat(oldToken.getIsUsed()).isTrue();
    }

    @Test
    void validateToken_withValidToken_returnsTrue() {
        // Arrange
        when(tokenRepository.findByToken(anyString())).thenReturn(Optional.of(validToken));

        // Act
        boolean result = passwordResetService.validateToken("valid-token-123");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    void validateToken_withUsedToken_returnsFalse() {
        // Arrange
        validToken.setIsUsed(true);
        when(tokenRepository.findByToken(anyString())).thenReturn(Optional.of(validToken));

        // Act
        boolean result = passwordResetService.validateToken("valid-token-123");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    void validateToken_withExpiredToken_returnsFalse() {
        // Arrange
        validToken.setExpiryDate(LocalDateTime.now().minusHours(1));
        when(tokenRepository.findByToken(anyString())).thenReturn(Optional.of(validToken));

        // Act
        boolean result = passwordResetService.validateToken("valid-token-123");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    void validateToken_withNonExistentToken_returnsFalse() {
        // Arrange
        when(tokenRepository.findByToken(anyString())).thenReturn(Optional.empty());

        // Act
        boolean result = passwordResetService.validateToken("non-existent-token");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    void resetPassword_withValidToken_resetsPassword() {
        // Arrange
        when(tokenRepository.findByToken(anyString())).thenReturn(Optional.of(validToken));
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode(anyString())).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(validToken);

        // Act
        passwordResetService.resetPassword("valid-token-123", "newPassword123");

        // Assert
        assertThat(testUser.getPassword()).isEqualTo("newEncodedPassword");
        assertThat(validToken.getIsUsed()).isTrue();

        verify(passwordEncoder).encode("newPassword123");
        verify(userRepository).save(testUser);
        verify(tokenRepository).save(validToken);
    }

    @Test
    void resetPassword_withInvalidToken_throwsException() {
        // Arrange
        when(tokenRepository.findByToken(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> passwordResetService.resetPassword("invalid-token", "newPassword"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Token không hợp lệ");

        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_withUsedToken_throwsException() {
        // Arrange
        validToken.setIsUsed(true);
        when(tokenRepository.findByToken(anyString())).thenReturn(Optional.of(validToken));

        // Act & Assert
        assertThatThrownBy(() -> passwordResetService.resetPassword("valid-token-123", "newPassword"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Token đã được sử dụng");

        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_withExpiredToken_throwsException() {
        // Arrange
        validToken.setExpiryDate(LocalDateTime.now().minusHours(1));
        when(tokenRepository.findByToken(anyString())).thenReturn(Optional.of(validToken));

        // Act & Assert
        assertThatThrownBy(() -> passwordResetService.resetPassword("valid-token-123", "newPassword"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Token đã hết hiệu lực");

        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_withNonExistentUser_throwsException() {
        // Arrange
        when(tokenRepository.findByToken(anyString())).thenReturn(Optional.of(validToken));
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> passwordResetService.resetPassword("valid-token-123", "newPassword"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Người dùng không tìm thấy");
    }
}
