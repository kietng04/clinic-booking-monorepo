package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.user.UserResponseDto;
import com.clinicbooking.userservice.dto.user.UserUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {

    UserResponseDto getUserById(Long id);

    Page<UserResponseDto> getAllUsers(Pageable pageable);

    List<UserResponseDto> getUsersByRole(String role);

    UserResponseDto updateUser(Long id, UserUpdateDto dto);

    void deleteUser(Long id);
}
