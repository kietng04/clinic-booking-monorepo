package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.user.UserResponseDto;
import com.clinicbooking.userservice.dto.user.UserUpdateDto;
import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.exception.UnauthorizedException;
import com.clinicbooking.userservice.exception.ValidationException;
import com.clinicbooking.userservice.mapper.UserMapper;
import com.clinicbooking.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private ProfileServiceImpl profileService;

    private User testUser;
    private UserResponseDto testUserDto;
    private UserUpdateDto updateDto;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword")
                .fullName("John Doe")
                .phone("0901234567")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender(User.Gender.MALE)
                .role(User.UserRole.PATIENT)
                .isActive(true)
                .build();

        testUserDto = UserResponseDto.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("John Doe")
                .phone("0901234567")
                .role("PATIENT")
                .build();

        updateDto = UserUpdateDto.builder()
                .fullName("Jane Doe")
                .phone("0909999999")
                .dateOfBirth(LocalDate.of(1992, 5, 15))
                .gender(User.Gender.FEMALE)
                .build();
    }

    @Test
    void getProfile_withValidUserId_returnsUserDto() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(userMapper.toDto(any(User.class))).thenReturn(testUserDto);

        // Act
        UserResponseDto result = profileService.getProfile(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).findById(1L);
        verify(userMapper).toDto(testUser);
    }

    @Test
    void getProfile_withInvalidUserId_throwsException() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> profileService.getProfile(999L))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Người dùng không tìm thấy");
    }

    @Test
    void updateProfile_withValidData_updatesUser() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(userRepository.existsByPhoneAndIdNot(anyString(), anyLong())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toDto(any(User.class))).thenReturn(testUserDto);

        // Act
        UserResponseDto result = profileService.updateProfile(1L, updateDto);

        // Assert
        assertThat(result).isNotNull();
        verify(userRepository).save(testUser);
        assertThat(testUser.getFullName()).isEqualTo("Jane Doe");
        assertThat(testUser.getPhone()).isEqualTo("0909999999");
    }

    @Test
    void updateProfile_withDuplicatePhone_throwsException() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(userRepository.existsByPhoneAndIdNot(anyString(), anyLong())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> profileService.updateProfile(1L, updateDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Số điện thoại đã tồn tại");

        verify(userRepository, never()).save(any());
    }

    @Test
    void updateProfile_withNullFields_keepsExistingValues() {
        // Arrange
        UserUpdateDto partialUpdate = UserUpdateDto.builder()
                .fullName("New Name")
                .build();

        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toDto(any(User.class))).thenReturn(testUserDto);

        // Act
        profileService.updateProfile(1L, partialUpdate);

        // Assert
        assertThat(testUser.getFullName()).isEqualTo("New Name");
        assertThat(testUser.getPhone()).isEqualTo("0901234567"); // Unchanged
        verify(userRepository).save(testUser);
    }

    @Test
    void updateProfile_withInvalidUserId_throwsException() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> profileService.updateProfile(999L, updateDto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Người dùng không tìm thấy");
    }

    @Test
    void changePassword_withValidCredentials_updatesPassword() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        profileService.changePassword(1L, "oldPassword", "newPassword123");

        // Assert
        verify(passwordEncoder).encode("newPassword123");
        verify(userRepository).save(testUser);
        assertThat(testUser.getPassword()).isEqualTo("newEncodedPassword");
    }

    @Test
    void changePassword_withWrongCurrentPassword_throwsException() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> profileService.changePassword(1L, "wrongPassword", "newPassword123"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Mật khẩu hiện tại không đúng");

        verify(userRepository, never()).save(any());
    }

    @Test
    void changePassword_withShortNewPassword_throwsException() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> profileService.changePassword(1L, "oldPassword", "short"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Mật khẩu phải có ít nhất 8 ký tự");

        verify(userRepository, never()).save(any());
    }

    @Test
    void changePassword_withInvalidUserId_throwsException() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> profileService.changePassword(999L, "oldPassword", "newPassword123"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Người dùng không tìm thấy");
    }

    @Test
    void uploadAvatar_withValidUrl_updatesAvatarUrl() {
        // Arrange
        String avatarUrl = "https://example.com/avatar.jpg";
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        String result = profileService.uploadAvatar(1L, avatarUrl);

        // Assert
        assertThat(result).isEqualTo(avatarUrl);
        assertThat(testUser.getAvatarUrl()).isEqualTo(avatarUrl);
        verify(userRepository).save(testUser);
    }

    @Test
    void uploadAvatar_withInvalidUserId_throwsException() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> profileService.uploadAvatar(999L, "https://example.com/avatar.jpg"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Người dùng không tìm thấy");
    }
}
