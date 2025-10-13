package com.clinicbooking.consultationservice.client;

import com.clinicbooking.consultationservice.dto.UserInfoDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Fallback for User Service Client
 */
@Component
@Slf4j
public class UserServiceClientFallback implements UserServiceClient {

    @Override
    public UserInfoDto getUserById(Long id) {
        log.warn("Fallback: Failed to get user with ID: {}", id);
        return UserInfoDto.builder()
                .id(id)
                .fullName("Unknown User")
                .isActive(false)
                .build();
    }

    @Override
    public UserInfoDto getDoctorById(Long id) {
        log.warn("Fallback: Failed to get doctor with ID: {}", id);
        return UserInfoDto.builder()
                .id(id)
                .fullName("Unknown Doctor")
                .role("DOCTOR")
                .isActive(false)
                .build();
    }
}
