package com.clinicbooking.userservice.controller;

import com.clinicbooking.userservice.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<Set<String>> getUserPermissions(@PathVariable Long userId) {
        return ResponseEntity.ok(permissionService.getUserPermissions(userId));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<Set<String>> getRolePermissions(@PathVariable String role) {
        return ResponseEntity.ok(permissionService.getRolePermissions(role));
    }

    @GetMapping("/user/{userId}/check/{permission}")
    public ResponseEntity<Boolean> hasPermission(
            @PathVariable Long userId,
            @PathVariable String permission) {
        return ResponseEntity.ok(permissionService.hasPermission(userId, permission));
    }
}
