package com.clinicbooking.userservice.controller;

import com.clinicbooking.userservice.service.ProfileService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileControllerAvatarUploadTest {

    @Mock
    private ProfileService profileService;

    @InjectMocks
    private ProfileController profileController;

    @BeforeEach
    void setUp() {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken("user@test.local", null);
        authentication.setDetails(10L);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void uploadAvatarFile_returnsAvatarUrl() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );
        when(profileService.uploadAvatar(eq(10L), any(MockMultipartFile.class)))
                .thenReturn("https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg");

        ResponseEntity<Map<String, String>> response = profileController.uploadAvatarFile(file);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).containsEntry(
                "avatarUrl", "https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg"
        );
    }

    @Test
    void uploadAvatar_legacyEndpointStillWorks() {
        when(profileService.uploadAvatar(10L, "https://legacy.example/avatar.jpg"))
                .thenReturn("https://legacy.example/avatar.jpg");

        ResponseEntity<Map<String, String>> response = profileController.uploadAvatar(
                Map.of("avatarUrl", "https://legacy.example/avatar.jpg")
        );

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).containsEntry("avatarUrl", "https://legacy.example/avatar.jpg");
    }
}

