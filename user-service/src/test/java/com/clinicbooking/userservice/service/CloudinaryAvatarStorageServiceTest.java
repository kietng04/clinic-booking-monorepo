package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.exception.ValidationException;
import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CloudinaryAvatarStorageServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    private CloudinaryAvatarStorageService service;

    @BeforeEach
    void setUp() {
        service = new CloudinaryAvatarStorageService(cloudinary, 5 * 1024 * 1024, "healthflow/avatars");
    }

    @Test
    void uploadAvatar_whenValidImage_returnsSecureUrlAndPublicId() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );

        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), any(Map.class)))
                .thenReturn(Map.of(
                        "secure_url", "https://res.cloudinary.com/demo/image/upload/v1/a.jpg",
                        "public_id", "healthflow/avatars/100/avatar_1"
                ));

        Map<String, String> result = service.uploadAvatar(100L, file);

        assertThat(result.get("url")).isEqualTo("https://res.cloudinary.com/demo/image/upload/v1/a.jpg");
        assertThat(result.get("publicId")).isEqualTo("healthflow/avatars/100/avatar_1");
    }

    @Test
    void uploadAvatar_whenUnsupportedContentType_throwsValidationException() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.gif",
                "image/gif",
                new byte[]{1, 2, 3}
        );

        assertThatThrownBy(() -> service.uploadAvatar(100L, file))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Định dạng ảnh không được hỗ trợ");
    }

    @Test
    void uploadAvatar_whenFileTooLarge_throwsValidationException() {
        byte[] data = new byte[6 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.jpg",
                "image/jpeg",
                data
        );

        assertThatThrownBy(() -> service.uploadAvatar(100L, file))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Kích thước ảnh vượt quá giới hạn");
    }

    @Test
    void deleteAvatar_whenBlankPublicId_skipsDestroy() throws IOException {
        service.deleteAvatar(" ");

        verify(cloudinary, never()).uploader();
        verify(uploader, never()).destroy(any(String.class), any(Map.class));
    }

    @Test
    void deleteAvatar_whenPublicIdPresent_callsDestroy() throws IOException {
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.destroy(any(String.class), any(Map.class)))
                .thenReturn(Map.of("result", "ok"));

        service.deleteAvatar("healthflow/avatars/100/avatar_1");

        verify(uploader).destroy(any(String.class), any(Map.class));
    }
}
