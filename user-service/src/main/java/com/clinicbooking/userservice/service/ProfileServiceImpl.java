package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.user.UserResponseDto;
import com.clinicbooking.userservice.dto.user.UserUpdateDto;
import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.exception.UnauthorizedException;
import com.clinicbooking.userservice.exception.ValidationException;
import com.clinicbooking.userservice.mapper.UserMapper;
import com.clinicbooking.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResponseDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ValidationException("Người dùng không tìm thấy"));
        return userMapper.toResponseDto(user);
    }

    @Override
    @Transactional
    public UserResponseDto updateProfile(Long userId, UserUpdateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ValidationException("Người dùng không tìm thấy"));

        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPhone() != null) {
            if (userRepository.existsByPhoneAndIdNot(dto.getPhone(), userId)) {
                throw new ValidationException("Số điện thoại đã tồn tại");
            }
            user.setPhone(dto.getPhone());
        }
        if (dto.getDateOfBirth() != null) user.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getGender() != null) user.setGender(dto.getGender());

        User savedUser = userRepository.save(user);
        log.info("Profile updated for user: {}", userId);
        return userMapper.toResponseDto(savedUser);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ValidationException("Người dùng không tìm thấy"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new UnauthorizedException("Mật khẩu hiện tại không đúng", "INVALID_PASSWORD");
        }

        if (newPassword.length() < 8) {
            throw new ValidationException("Mật khẩu phải có ít nhất 8 ký tự");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed for user: {}", userId);
    }

    @Override
    @Transactional
    public String uploadAvatar(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ValidationException("Người dùng không tìm thấy"));
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        return avatarUrl;
    }
}
