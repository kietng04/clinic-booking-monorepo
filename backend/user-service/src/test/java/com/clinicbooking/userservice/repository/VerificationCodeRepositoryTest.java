package com.clinicbooking.userservice.repository;

import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.entity.VerificationCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class VerificationCodeRepositoryTest {

    @Autowired
    private VerificationCodeRepository verificationCodeRepository;

    @Autowired
    private TestEntityManager entityManager;

    private User testUser;
    private VerificationCode emailCode;
    private VerificationCode smsCode;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("test@example.com")
                .password("password123")
                .fullName("Test User")
                .role(User.UserRole.PATIENT)
                .isActive(true)
                .build();
        entityManager.persistAndFlush(testUser);

        emailCode = VerificationCode.builder()
                .userId(testUser.getId())
                .type(VerificationCode.VerificationType.EMAIL)
                .code("email-token-123")
                .expiryDate(LocalDateTime.now().plusHours(1))
                .isVerified(false)
                .attemptCount(0)
                .build();
        entityManager.persistAndFlush(emailCode);

        smsCode = VerificationCode.builder()
                .userId(testUser.getId())
                .type(VerificationCode.VerificationType.SMS)
                .code("123456")
                .expiryDate(LocalDateTime.now().plusMinutes(30))
                .isVerified(false)
                .attemptCount(0)
                .build();
        entityManager.persistAndFlush(smsCode);

        entityManager.clear();
    }

    @Test
    void findByUserIdAndTypeAndIsVerifiedFalse_findsUnverifiedEmailCode() {
        // Act
        Optional<VerificationCode> result = verificationCodeRepository
                .findByUserIdAndTypeAndIsVerifiedFalse(testUser.getId(), VerificationCode.VerificationType.EMAIL);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getCode()).isEqualTo("email-token-123");
        assertThat(result.get().getType()).isEqualTo(VerificationCode.VerificationType.EMAIL);
    }

    @Test
    void findByUserIdAndTypeAndIsVerifiedFalse_findsSmsCode() {
        // Act
        Optional<VerificationCode> result = verificationCodeRepository
                .findByUserIdAndTypeAndIsVerifiedFalse(testUser.getId(), VerificationCode.VerificationType.SMS);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getCode()).isEqualTo("123456");
        assertThat(result.get().getType()).isEqualTo(VerificationCode.VerificationType.SMS);
    }

    @Test
    void findByUserIdAndTypeAndIsVerifiedFalse_emptyWhenVerified() {
        // Arrange
        emailCode.setIsVerified(true);
        entityManager.merge(emailCode);
        entityManager.flush();
        entityManager.clear();

        // Act
        Optional<VerificationCode> result = verificationCodeRepository
                .findByUserIdAndTypeAndIsVerifiedFalse(testUser.getId(), VerificationCode.VerificationType.EMAIL);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void findByUserIdAndCode_findsMatchingCode() {
        // Act
        Optional<VerificationCode> result = verificationCodeRepository
                .findByUserIdAndCode(testUser.getId(), "123456");

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getType()).isEqualTo(VerificationCode.VerificationType.SMS);
    }

    @Test
    void findByUserIdAndCode_emptyForWrongCode() {
        // Act
        Optional<VerificationCode> result = verificationCodeRepository
                .findByUserIdAndCode(testUser.getId(), "wrong-code");

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void findByUserIdAndCode_emptyForWrongUserId() {
        // Act
        Optional<VerificationCode> result = verificationCodeRepository
                .findByUserIdAndCode(999L, "123456");

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void save_updatesAttemptCount() {
        // Arrange
        VerificationCode code = verificationCodeRepository
                .findByUserIdAndCode(testUser.getId(), "123456").orElseThrow();
        code.setAttemptCount(code.getAttemptCount() + 1);

        // Act
        verificationCodeRepository.saveAndFlush(code);
        entityManager.clear();

        // Assert
        VerificationCode updated = verificationCodeRepository
                .findByUserIdAndCode(testUser.getId(), "123456").orElseThrow();
        assertThat(updated.getAttemptCount()).isEqualTo(1);
    }
}
