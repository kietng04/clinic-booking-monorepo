package com.clinicbooking.userservice.controller;

import com.clinicbooking.userservice.dto.profile.NotificationPreferencesDto;
import com.clinicbooking.userservice.dto.user.UserResponseDto;
import com.clinicbooking.userservice.dto.user.UserUpdateDto;
import com.clinicbooking.userservice.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    private Long extractUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof Long) {
            return (Long) auth.getDetails();
        }
        throw new RuntimeException("Cannot extract user ID from authentication");
    }

    @GetMapping
    public ResponseEntity<UserResponseDto> getProfile() {
        Long userId = extractUserId();
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PutMapping
    public ResponseEntity<UserResponseDto> updateProfile(@RequestBody UserUpdateDto dto) {
        Long userId = extractUserId();
        return ResponseEntity.ok(profileService.updateProfile(userId, dto));
    }

    @GetMapping("/notifications")
    public ResponseEntity<NotificationPreferencesDto> getNotificationPreferences() {
        Long userId = extractUserId();
        return ResponseEntity.ok(profileService.getNotificationPreferences(userId));
    }

    @PutMapping("/notifications")
    public ResponseEntity<NotificationPreferencesDto> updateNotificationPreferences(
            @Valid @RequestBody NotificationPreferencesDto dto
    ) {
        Long userId = extractUserId();
        return ResponseEntity.ok(profileService.updateNotificationPreferences(userId, dto));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> request) {
        Long userId = extractUserId();
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        profileService.changePassword(userId, currentPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Mật khẩu đã được thay đổi thành công"));
    }

    @PostMapping("/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(@RequestBody Map<String, String> request) {
        Long userId = extractUserId();
        String avatarUrl = request.get("avatarUrl");
        String url = profileService.uploadAvatar(userId, avatarUrl);
        return ResponseEntity.ok(Map.of("avatarUrl", url));
    }

    @PostMapping("/avatar/upload")
    public ResponseEntity<Map<String, String>> uploadAvatarFile(@RequestParam("file") MultipartFile file) {
        Long userId = extractUserId();
        String url = profileService.uploadAvatar(userId, file);
        return ResponseEntity.ok(Map.of("avatarUrl", url));
    }
}
