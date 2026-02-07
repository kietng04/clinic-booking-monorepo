package com.clinicbooking.userservice.repository;

import com.clinicbooking.userservice.entity.PasswordResetToken;
import com.clinicbooking.userservice.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class PasswordResetTokenRepositoryTest {

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private TestEntityManager entityManager;

    private User testUser;
    private PasswordResetToken validToken;
    private PasswordResetToken usedToken;

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

        validToken = PasswordResetToken.builder()
                .userId(testUser.getId())
                .token(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plusHours(24))
                .isUsed(false)
                .build();
        entityManager.persistAndFlush(validToken);

        usedToken = PasswordResetToken.builder()
                .userId(testUser.getId())
                .token(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plusHours(24))
                .isUsed(true)
                .build();
        entityManager.persistAndFlush(usedToken);

        entityManager.clear();
    }

    @Test
    void findByToken_findsValidToken() {
        // Act
        Optional<PasswordResetToken> result = passwordResetTokenRepository.findByToken(validToken.getToken());

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getUserId()).isEqualTo(testUser.getId());
        assertThat(result.get().getIsUsed()).isFalse();
    }

    @Test
    void findByToken_findsUsedToken() {
        // Act
        Optional<PasswordResetToken> result = passwordResetTokenRepository.findByToken(usedToken.getToken());

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getIsUsed()).isTrue();
    }

    @Test
    void findByToken_emptyForNonExistentToken() {
        // Act
        Optional<PasswordResetToken> result = passwordResetTokenRepository
                .findByToken("non-existent-token");

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void findByUserIdAndIsUsedFalse_findsUnusedToken() {
        // Act
        Optional<PasswordResetToken> result = passwordResetTokenRepository
                .findByUserIdAndIsUsedFalse(testUser.getId());

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getToken()).isEqualTo(validToken.getToken());
    }

    @Test
    void findByUserIdAndIsUsedFalse_emptyWhenAllTokensUsed() {
        // Arrange
        validToken.setIsUsed(true);
        entityManager.merge(validToken);
        entityManager.flush();
        entityManager.clear();

        // Act
        Optional<PasswordResetToken> result = passwordResetTokenRepository
                .findByUserIdAndIsUsedFalse(testUser.getId());

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void save_updatesIsUsedFlag() {
        // Arrange
        PasswordResetToken token = passwordResetTokenRepository.findByToken(validToken.getToken()).orElseThrow();
        token.setIsUsed(true);

        // Act
        passwordResetTokenRepository.saveAndFlush(token);
        entityManager.clear();

        // Assert
        PasswordResetToken updated = passwordResetTokenRepository.findByToken(validToken.getToken()).orElseThrow();
        assertThat(updated.getIsUsed()).isTrue();
    }

    @Test
    void findByUserIdAndIsUsedFalse_emptyForNonExistentUser() {
        // Act
        Optional<PasswordResetToken> result = passwordResetTokenRepository
                .findByUserIdAndIsUsedFalse(999L);

        // Assert
        assertThat(result).isEmpty();
    }
}
