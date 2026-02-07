package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.user.UserCreateDto;
import com.clinicbooking.userservice.dto.user.UserResponseDto;
import com.clinicbooking.userservice.dto.user.UserUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface UserService {

    UserResponseDto createUser(UserCreateDto dto);

    UserResponseDto getUserById(Long id);

    Page<UserResponseDto> getAllUsers(Pageable pageable);

    List<UserResponseDto> getUsersByRole(String role);

    UserResponseDto updateUser(Long id, UserUpdateDto dto);

    void deleteUser(Long id);

    UserResponseDto getCurrentUserProfile(String email);

    Page<UserResponseDto> searchDoctors(String keyword, String specialization, BigDecimal minRating, BigDecimal maxFee, Pageable pageable);

    List<String> getSpecializations();
}
