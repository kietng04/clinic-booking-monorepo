package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.profile.NotificationPreferencesDto;
import com.clinicbooking.userservice.dto.user.UserResponseDto;
import com.clinicbooking.userservice.dto.user.UserUpdateDto;
import com.clinicbooking.userservice.entity.NotificationPreferences;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileServiceImpl implements ProfileService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AvatarStorageService avatarStorageService;

    @Override
    @Transactional(readOnly = true)
    public UserResponseDto getProfile(Long userId) {
        User user = findUserOrThrow(userId);
        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public UserResponseDto updateProfile(Long userId, UserUpdateDto dto) {
        User user = findUserOrThrow(userId);

        if (dto.getFullName() != null)
            user.setFullName(dto.getFullName());
        if (dto.getPhone() != null) {
            if (userRepository.existsByPhoneAndIdNot(dto.getPhone(), userId)) {
                throw new ValidationException("Số điện thoại đã tồn tại");
            }
            user.setPhone(dto.getPhone());
        }
        if (dto.getDateOfBirth() != null)
            user.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getGender() != null)
            user.setGender(dto.getGender());

        User savedUser = userRepository.save(user);
        log.info("Profile updated for user: {}", userId);
        return userMapper.toDto(savedUser);
    }

    @Override
    @Transactional
    public NotificationPreferencesDto getNotificationPreferences(Long userId) {
        User user = findUserOrThrow(userId);
        boolean needsBackfill = !user.hasCompleteNotificationPreferences();
        NotificationPreferences preferences = user.getNotificationPreferences();
        if (needsBackfill) {
            userRepository.save(user);
        }
        return toDto(preferences);
    }

    @Override
    @Transactional
    public NotificationPreferencesDto updateNotificationPreferences(Long userId, NotificationPreferencesDto dto) {
        User user = findUserOrThrow(userId);
        user.setNotificationPreferences(toEntity(dto));
        User savedUser = userRepository.save(user);
        log.info("Notification preferences updated for user: {}", userId);
        return toDto(savedUser.getNotificationPreferences());
    }

    @Override
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = findUserOrThrow(userId);

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
        if (avatarUrl == null || avatarUrl.isBlank()) {
            throw new ValidationException("URL ảnh đại diện không hợp lệ");
        }

        User user = findUserOrThrow(userId);
        user.setAvatarUrl(avatarUrl);
        user.setAvatarPublicId(null);
        userRepository.save(user);
        return avatarUrl;
    }

    @Override
    @Transactional
    public String uploadAvatar(Long userId, MultipartFile file) {
        User user = findUserOrThrow(userId);

        Map<String, String> uploadResult = avatarStorageService.uploadAvatar(userId, file);
        String avatarUrl = uploadResult.get("url");
        String newPublicId = uploadResult.get("publicId");
        if (avatarUrl == null || avatarUrl.isBlank()) {
            throw new ValidationException("Upload ảnh thất bại");
        }

        String oldPublicId = user.getAvatarPublicId();
        if (oldPublicId != null && !oldPublicId.isBlank() && !oldPublicId.equals(newPublicId)) {
            avatarStorageService.deleteAvatar(oldPublicId);
        }

        user.setAvatarUrl(avatarUrl);
        user.setAvatarPublicId(newPublicId);
        userRepository.save(user);
        return avatarUrl;
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ValidationException("Người dùng không tìm thấy"));
    }

    private NotificationPreferencesDto toDto(NotificationPreferences preferences) {
        return NotificationPreferencesDto.builder()
                .emailReminders(preferences.getEmailReminders())
                .emailPrescription(preferences.getEmailPrescription())
                .emailLabResults(preferences.getEmailLabResults())
                .emailMarketing(preferences.getEmailMarketing())
                .smsReminders(preferences.getSmsReminders())
                .smsUrgent(preferences.getSmsUrgent())
                .pushAll(preferences.getPushAll())
                .reminderTiming(preferences.getReminderTiming())
                .build();
    }

    private NotificationPreferences toEntity(NotificationPreferencesDto dto) {
        return NotificationPreferences.builder()
                .emailReminders(dto.getEmailReminders())
                .emailPrescription(dto.getEmailPrescription())
                .emailLabResults(dto.getEmailLabResults())
                .emailMarketing(dto.getEmailMarketing())
                .smsReminders(dto.getSmsReminders())
                .smsUrgent(dto.getSmsUrgent())
                .pushAll(dto.getPushAll())
                .reminderTiming(dto.getReminderTiming())
                .build();
    }
}
