package com.clinicbooking.userservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.clinicbooking.userservice.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Service
@ConditionalOnBean(Cloudinary.class)
@Slf4j
public class CloudinaryAvatarStorageService implements AvatarStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Cloudinary cloudinary;
    private final long maxFileSizeBytes;
    private final String avatarFolder;

    public CloudinaryAvatarStorageService(
            Cloudinary cloudinary,
            @Value("${avatar.max-file-size-bytes:5242880}") long maxFileSizeBytes,
            @Value("${avatar.folder:healthflow/avatars}") String avatarFolder
    ) {
        this.cloudinary = cloudinary;
        this.maxFileSizeBytes = maxFileSizeBytes;
        this.avatarFolder = avatarFolder;
    }

    @Override
    public Map<String, String> uploadAvatar(Long userId, MultipartFile file) {
        validateFile(file);

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", avatarFolder + "/" + userId,
                    "resource_type", "image",
                    "overwrite", true,
                    "invalidate", true
            ));

            Object secureUrl = result.get("secure_url");
            Object publicId = result.get("public_id");
            if (secureUrl == null || publicId == null) {
                throw new ValidationException("Upload ảnh thất bại: thiếu dữ liệu phản hồi");
            }

            return Map.of(
                    "url", secureUrl.toString(),
                    "publicId", publicId.toString()
            );
        } catch (IOException ex) {
            throw new ValidationException("Không thể tải ảnh lên hệ thống lưu trữ", ex);
        }
    }

    @Override
    public void deleteAvatar(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                    "resource_type", "image",
                    "invalidate", true
            ));
        } catch (Exception ex) {
            log.warn("Failed to delete Cloudinary avatar: publicId={}, error={}", publicId, ex.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Vui lòng chọn ảnh đại diện");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ValidationException("Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận JPG, PNG, WEBP");
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new ValidationException("Kích thước ảnh vượt quá giới hạn cho phép");
        }
    }
}

