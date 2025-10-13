package com.clinicbooking.medicalservice.client;

import com.clinicbooking.medicalservice.dto.UserDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class UserServiceClientFallback implements UserServiceClient {

    @Override
    public UserDto getUserById(Long id) {
        log.warn("Fallback: User service is unavailable. Returning placeholder for user ID: {}", id);
        return UserDto.builder()
                .id(id)
                .email("unknown@fallback.com")
                .fullName("Unknown User")
                .phone("N/A")
                .role("UNKNOWN")
                .build();
    }
}
