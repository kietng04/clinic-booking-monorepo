package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.user.UserResponseDto;
import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.event.UserEventPublisher;
import com.clinicbooking.userservice.mapper.UserMapper;
import com.clinicbooking.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private UserEventPublisher eventPublisher;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User testDoctor1;
    private User testDoctor2;
    private UserResponseDto testDoctorDto1;
    private UserResponseDto testDoctorDto2;
    private Page<User> doctorPage;

    @BeforeEach
    void setUp() {
        testDoctor1 = User.builder()
                .id(1L)
                .email("doctor1@test.com")
                .fullName("Dr. Sarah Johnson")
                .role(User.UserRole.DOCTOR)
                .specialization("Cardiology")
                .rating(BigDecimal.valueOf(4.5))
                .consultationFee(BigDecimal.valueOf(500000))
                .experienceYears(10)
                .workplace("City Hospital")
                .isActive(true)
                .build();

        testDoctor2 = User.builder()
                .id(2L)
                .email("doctor2@test.com")
                .fullName("Dr. Michael Chen")
                .role(User.UserRole.DOCTOR)
                .specialization("Dermatology")
                .rating(BigDecimal.valueOf(4.8))
                .consultationFee(BigDecimal.valueOf(700000))
                .experienceYears(8)
                .workplace("Central Clinic")
                .isActive(true)
                .build();

        testDoctorDto1 = UserResponseDto.builder()
                .id(1L)
                .email("doctor1@test.com")
                .fullName("Dr. Sarah Johnson")
                .role("DOCTOR")
                .specialization("Cardiology")
                .rating(BigDecimal.valueOf(4.5))
                .consultationFee(BigDecimal.valueOf(500000))
                .build();

        testDoctorDto2 = UserResponseDto.builder()
                .id(2L)
                .email("doctor2@test.com")
                .fullName("Dr. Michael Chen")
                .role("DOCTOR")
                .specialization("Dermatology")
                .rating(BigDecimal.valueOf(4.8))
                .consultationFee(BigDecimal.valueOf(700000))
                .build();

        doctorPage = new PageImpl<>(Arrays.asList(testDoctor1, testDoctor2));
    }

    @Test
    void searchDoctors_callsRepositoryWithCorrectParams() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.searchDoctors(any(), any(), any(), any(), any(), any()))
                .thenReturn(doctorPage);
        when(userMapper.toDto(testDoctor1)).thenReturn(testDoctorDto1);
        when(userMapper.toDto(testDoctor2)).thenReturn(testDoctorDto2);

        // Act
        Page<UserResponseDto> result = userService.searchDoctors(
                "sarah",
                "Cardiology",
                BigDecimal.valueOf(4.0),
                BigDecimal.valueOf(1000000),
                pageable
        );

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        verify(userRepository).searchDoctors(
                eq(User.UserRole.DOCTOR),
                eq("sarah"),
                eq("Cardiology"),
                eq(BigDecimal.valueOf(4.0)),
                eq(BigDecimal.valueOf(1000000)),
                eq(pageable)
        );
        verify(userMapper, times(2)).toDto(any(User.class));
    }

    @Test
    void searchDoctors_withBlankKeyword_passesNullToRepository() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.searchDoctors(any(), any(), any(), any(), any(), any()))
                .thenReturn(doctorPage);
        when(userMapper.toDto(any())).thenReturn(testDoctorDto1);

        // Act
        userService.searchDoctors("   ", null, null, null, pageable);

        // Assert - Blank keyword should be converted to null
        verify(userRepository).searchDoctors(
                eq(User.UserRole.DOCTOR),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                eq(pageable)
        );
    }

    @Test
    void searchDoctors_withBlankSpecialization_passesNullToRepository() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.searchDoctors(any(), any(), any(), any(), any(), any()))
                .thenReturn(doctorPage);
        when(userMapper.toDto(any())).thenReturn(testDoctorDto1);

        // Act
        userService.searchDoctors(null, "  ", null, null, pageable);

        // Assert - Blank specialization should be converted to null
        verify(userRepository).searchDoctors(
                eq(User.UserRole.DOCTOR),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                eq(pageable)
        );
    }

    @Test
    void searchDoctors_trimsKeywordAndSpecialization() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.searchDoctors(any(), any(), any(), any(), any(), any()))
                .thenReturn(doctorPage);
        when(userMapper.toDto(any())).thenReturn(testDoctorDto1);

        // Act
        userService.searchDoctors("  sarah  ", "  Cardiology  ", null, null, pageable);

        // Assert - Should trim whitespace
        verify(userRepository).searchDoctors(
                eq(User.UserRole.DOCTOR),
                eq("sarah"),
                eq("Cardiology"),
                isNull(),
                isNull(),
                eq(pageable)
        );
    }

    @Test
    void searchDoctors_mapsResultsCorrectly() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.searchDoctors(any(), any(), any(), any(), any(), any()))
                .thenReturn(doctorPage);
        when(userMapper.toDto(testDoctor1)).thenReturn(testDoctorDto1);
        when(userMapper.toDto(testDoctor2)).thenReturn(testDoctorDto2);

        // Act
        Page<UserResponseDto> result = userService.searchDoctors(
                null, null, null, null, pageable
        );

        // Assert - Verify DTOs are correctly mapped
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getId()).isEqualTo(1L);
        assertThat(result.getContent().get(0).getFullName()).isEqualTo("Dr. Sarah Johnson");
        assertThat(result.getContent().get(1).getId()).isEqualTo(2L);
        assertThat(result.getContent().get(1).getFullName()).isEqualTo("Dr. Michael Chen");
    }

    @Test
    void searchDoctors_withPagination_returnsPagedResults() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 1);
        Page<User> singleDoctorPage = new PageImpl<>(
                List.of(testDoctor1),
                pageable,
                2
        );
        when(userRepository.searchDoctors(any(), any(), any(), any(), any(), any()))
                .thenReturn(singleDoctorPage);
        when(userMapper.toDto(testDoctor1)).thenReturn(testDoctorDto1);

        // Act
        Page<UserResponseDto> result = userService.searchDoctors(
                null, null, null, null, pageable
        );

        // Assert - Verify pagination info
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getTotalPages()).isEqualTo(2);
        assertThat(result.hasNext()).isTrue();
    }

    @Test
    void getSpecializations_returnsListFromRepository() {
        // Arrange
        List<String> specializations = Arrays.asList(
                "Cardiology",
                "Dermatology",
                "Pediatrics"
        );
        when(userRepository.findDistinctSpecializations()).thenReturn(specializations);

        // Act
        List<String> result = userService.getSpecializations();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly("Cardiology", "Dermatology", "Pediatrics");
        verify(userRepository).findDistinctSpecializations();
    }

    @Test
    void searchDoctors_withAllNullParams_searchesWithNullFilters() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.searchDoctors(any(), any(), any(), any(), any(), any()))
                .thenReturn(doctorPage);
        when(userMapper.toDto(any())).thenReturn(testDoctorDto1);

        // Act
        userService.searchDoctors(null, null, null, null, pageable);

        // Assert - All filter params should be null
        verify(userRepository).searchDoctors(
                eq(User.UserRole.DOCTOR),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                eq(pageable)
        );
    }
}
