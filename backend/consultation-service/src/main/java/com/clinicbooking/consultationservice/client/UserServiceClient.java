package com.clinicbooking.consultationservice.client;

import com.clinicbooking.consultationservice.dto.UserInfoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client for User Service
 */
@FeignClient(name = "user-service", fallback = UserServiceClientFallback.class)
public interface UserServiceClient {

    /**
     * Get user information by ID
     */
    @GetMapping("/api/users/{id}")
    UserInfoDto getUserById(@PathVariable("id") Long id);

    /**
     * Get doctor information by ID
     */
    @GetMapping("/api/users/{id}")
    UserInfoDto getDoctorById(@PathVariable("id") Long id);
}
