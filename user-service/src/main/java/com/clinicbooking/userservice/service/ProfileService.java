package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.user.UserResponseDto;
import com.clinicbooking.userservice.dto.user.UserUpdateDto;
import org.springframework.web.multipart.MultipartFile;

public interface ProfileService {
    UserResponseDto getProfile(Long userId);
    UserResponseDto updateProfile(Long userId, UserUpdateDto dto);
    void changePassword(Long userId, String currentPassword, String newPassword);
    String uploadAvatar(Long userId, String avatarUrl);
    String uploadAvatar(Long userId, MultipartFile file);
}
