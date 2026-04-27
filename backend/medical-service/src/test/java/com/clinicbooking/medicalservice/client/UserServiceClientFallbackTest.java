package com.clinicbooking.medicalservice.client;

import com.clinicbooking.medicalservice.dto.UserDto;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserServiceClientFallbackTest {

    @Test
    void getUserByIdReturnsPlaceholderUser() {
        UserServiceClientFallback fallback = new UserServiceClientFallback();

        UserDto result = fallback.getUserById(77L);

        assertThat(result.getId()).isEqualTo(77L);
        assertThat(result.getEmail()).isEqualTo("unknown@fallback.com");
        assertThat(result.getFullName()).isEqualTo("Unknown User");
        assertThat(result.getPhone()).isEqualTo("N/A");
        assertThat(result.getRole()).isEqualTo("UNKNOWN");
    }
}
