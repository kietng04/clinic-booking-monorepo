package com.clinicbooking.clinic_booking_system.controller.v2;

import com.clinicbooking.clinic_booking_system.dto.user.UserResponseDto;
import com.clinicbooking.clinic_booking_system.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Example of API Version 2 Controller
 * Demonstrates how to create new API versions with breaking changes
 *
 * V2 Changes (example):
 * - Returns additional metadata in responses
 * - Different response structure
 * - New features not available in V1
 */
@RestController
@RequestMapping("/api/v2/users")
@RequiredArgsConstructor
@Tag(name = "Users V2", description = "User management APIs - Version 2")
public class UserV2Controller {

    private final UserService userService;

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID (V2)", description = "Returns user with additional metadata")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        UserResponseDto user = userService.getUserById(id);

        // V2 response includes metadata
        Map<String, Object> response = new HashMap<>();
        response.put("version", "2.0");
        response.put("data", user);
        response.put("metadata", Map.of(
                "timestamp", System.currentTimeMillis(),
                "deprecated", false,
                "links", Map.of(
                        "self", "/api/v2/users/" + id,
                        "appointments", "/api/v2/users/" + id + "/appointments"
                )
        ));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/summary")
    @Operation(summary = "Get user summary (V2 only)", description = "New endpoint available only in V2")
    public ResponseEntity<Map<String, Object>> getUserSummary(@PathVariable Long id) {
        UserResponseDto user = userService.getUserById(id);

        Map<String, Object> summary = new HashMap<>();
        summary.put("id", user.getId());
        summary.put("fullName", user.getFullName());
        summary.put("email", user.getEmail());
        summary.put("role", user.getRole());
        summary.put("isActive", user.getIsActive());

        // Additional V2 features
        if (user.getRole().toString().equals("DOCTOR")) {
            summary.put("specialization", user.getSpecialization());
            summary.put("rating", user.getRating());
        }

        return ResponseEntity.ok(Map.of(
                "version", "2.0",
                "summary", summary
        ));
    }
}
