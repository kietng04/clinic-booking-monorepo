package com.clinicbooking.userservice.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface AvatarStorageService {

    Map<String, String> uploadAvatar(Long userId, MultipartFile file);

    void deleteAvatar(String publicId);
}

