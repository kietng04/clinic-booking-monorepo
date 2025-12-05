package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.user.UserCreateDto;
import com.clinicbooking.clinic_booking_system.dto.user.UserResponseDto;
import com.clinicbooking.clinic_booking_system.dto.user.UserUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.User;
import com.clinicbooking.clinic_booking_system.exception.BadRequestException;
import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import com.clinicbooking.clinic_booking_system.mapper.UserMapper;
import com.clinicbooking.clinic_booking_system.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserCreateDto createDto;
    private UserUpdateDto updateDto;
    private UserResponseDto responseDto;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword")
                .fullName("Test User")
                .phone("0123456789")
                .role(User.UserRole.PATIENT)
                .isActive(true)
                .build();

        createDto = UserCreateDto.builder()
                .email("test@example.com")
                .password("password123")
                .fullName("Test User")
                .role(User.UserRole.PATIENT)
                .build();

        updateDto = UserUpdateDto.builder()
                .fullName("Updated Name")
                .phone("0987654321")
                .build();

        responseDto = UserResponseDto.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("Test User")
                .role(User.UserRole.PATIENT)
                .build();
    }

    @Nested
    @DisplayName("Create User Tests")
    class CreateUserTests {

        @Test
        @DisplayName("Should create user successfully")
        void shouldCreateUserSuccessfully() {
            when(userRepository.existsByEmail(createDto.getEmail())).thenReturn(false);
            when(userMapper.toEntity(createDto)).thenReturn(testUser);
            when(passwordEncoder.encode(createDto.getPassword())).thenReturn("encodedPassword");
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(userMapper.toResponseDto(testUser)).thenReturn(responseDto);

            UserResponseDto result = userService.createUser(createDto);

            assertThat(result).isNotNull();
            assertThat(result.getEmail()).isEqualTo(testUser.getEmail());
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when email already exists")
        void shouldThrowExceptionWhenEmailExists() {
            when(userRepository.existsByEmail(createDto.getEmail())).thenReturn(true);

            assertThatThrownBy(() -> userService.createUser(createDto))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Email đã tồn tại");

            verify(userRepository, never()).save(any(User.class));
        }
    }

    @Nested
    @DisplayName("Get User Tests")
    class GetUserTests {

        @Test
        @DisplayName("Should get user by id successfully")
        void shouldGetUserByIdSuccessfully() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userMapper.toResponseDto(testUser)).thenReturn(responseDto);

            UserResponseDto result = userService.getUserById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Should throw exception when user not found by id")
        void shouldThrowExceptionWhenUserNotFoundById() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserById(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Should get user by email successfully")
        void shouldGetUserByEmailSuccessfully() {
            when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
            when(userMapper.toResponseDto(testUser)).thenReturn(responseDto);

            UserResponseDto result = userService.getUserByEmail(testUser.getEmail());

            assertThat(result).isNotNull();
            assertThat(result.getEmail()).isEqualTo(testUser.getEmail());
        }
    }

    @Nested
    @DisplayName("Update User Tests")
    class UpdateUserTests {

        @Test
        @DisplayName("Should update user successfully")
        void shouldUpdateUserSuccessfully() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(userMapper.toResponseDto(testUser)).thenReturn(responseDto);

            UserResponseDto result = userService.updateUser(1L, updateDto);

            assertThat(result).isNotNull();
            verify(userMapper).updateEntity(testUser, updateDto);
            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("Should throw exception when phone already exists")
        void shouldThrowExceptionWhenPhoneExists() {
            updateDto.setPhone("0111111111");
            testUser.setPhone("0123456789");
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.existsByPhone(updateDto.getPhone())).thenReturn(true);

            assertThatThrownBy(() -> userService.updateUser(1L, updateDto))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Số điện thoại đã tồn tại");
        }
    }

    @Nested
    @DisplayName("Deactivate User Tests")
    class DeactivateUserTests {

        @Test
        @DisplayName("Should deactivate user successfully")
        void shouldDeactivateUserSuccessfully() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            userService.deactivateUser(1L);

            assertThat(testUser.getIsActive()).isFalse();
            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void shouldThrowExceptionWhenUserNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.deactivateUser(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
