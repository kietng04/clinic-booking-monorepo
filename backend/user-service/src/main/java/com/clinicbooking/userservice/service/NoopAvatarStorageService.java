package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.exception.ValidationException;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public class NoopAvatarStorageService implements AvatarStorageService {

    @Override
    public Map<String, String> uploadAvatar(Long userId, MultipartFile file) {
        throw new ValidationException("Avatar storage chưa được cấu hình");
    }

    @Override
    public void deleteAvatar(String publicId) {
        // No-op intentionally.
    }
}
