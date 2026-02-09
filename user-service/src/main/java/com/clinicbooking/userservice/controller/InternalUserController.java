package com.clinicbooking.userservice.controller;

import com.clinicbooking.userservice.dto.user.UserBasicInfoDto;
import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Internal service-to-service endpoints.
 * These are explicitly whitelisted in SecurityConfig under /api/users/internal/**.
 */
@RestController
@RequestMapping("/api/users/internal")
@RequiredArgsConstructor
@Slf4j
public class InternalUserController {

    private final UserRepository userRepository;

    @PostMapping("/basic/by-ids")
    public ResponseEntity<List<UserBasicInfoDto>> getBasicUsersByIds(@RequestBody(required = false) List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        // De-duplicate while preserving order to keep payload stable.
        Set<Long> uniqueIds = new LinkedHashSet<>(ids);
        List<UserBasicInfoDto> result = new ArrayList<>();
        for (User user : userRepository.findAllById(uniqueIds)) {
            result.add(UserBasicInfoDto.builder()
                    .id(user.getId())
                    .dateOfBirth(user.getDateOfBirth())
                    .gender(user.getGender() != null ? user.getGender().name() : null)
                    .build());
        }

        log.debug("Internal basic user lookup: requested={}, returned={}", uniqueIds.size(), result.size());
        return ResponseEntity.ok(result);
    }
}

