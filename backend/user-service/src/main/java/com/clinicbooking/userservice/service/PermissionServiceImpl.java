package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.exception.ResourceNotFoundException;
import com.clinicbooking.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionServiceImpl implements PermissionService {

    private final UserRepository userRepository;

    private static final Map<String, Set<String>> ROLE_PERMISSIONS = new HashMap<>();

    static {
        ROLE_PERMISSIONS.put("PATIENT", Set.of(
                "appointments.view_own", "appointments.create", "appointments.cancel",
                "medical_records.view", "profile.view", "profile.edit"
        ));
        ROLE_PERMISSIONS.put("DOCTOR", Set.of(
                "appointments.view_own", "appointments.view_all", "appointments.create",
                "appointments.cancel", "medical_records.create", "medical_records.view",
                "prescriptions.create", "profile.view", "profile.edit"
        ));
        ROLE_PERMISSIONS.put("RECEPTIONIST", Set.of(
                "appointments.view_all", "appointments.create", "appointments.cancel",
                "appointments.check_in", "profile.view", "profile.edit"
        ));
        ROLE_PERMISSIONS.put("NURSE", Set.of(
                "appointments.view_all", "appointments.check_in",
                "medical_records.view", "profile.view", "profile.edit"
        ));
        ROLE_PERMISSIONS.put("LAB_TECHNICIAN", Set.of(
                "lab_tests.view", "lab_tests.update", "profile.view", "profile.edit"
        ));
        ROLE_PERMISSIONS.put("PHARMACIST", Set.of(
                "prescriptions.view", "medications.manage", "profile.view", "profile.edit"
        ));
        ROLE_PERMISSIONS.put("ADMIN", Set.of(
                "appointments.view_all", "appointments.create", "appointments.cancel",
                "medical_records.view", "medical_records.create", "users.manage",
                "clinics.manage", "payments.process", "reports.view",
                "profile.view", "profile.edit"
        ));
    }

    @Override
    public Set<String> getUserPermissions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tìm thấy"));
        return getRolePermissions(user.getRole().name());
    }

    @Override
    public boolean hasPermission(Long userId, String permissionCode) {
        Set<String> permissions = getUserPermissions(userId);
        return permissions.contains(permissionCode);
    }

    @Override
    public void grantPermission(Long userId, String permissionCode) {
        // For now, permissions are role-based. Custom grants can be added later.
        log.info("Permission {} granted to user {}", permissionCode, userId);
    }

    @Override
    public void revokePermission(Long userId, String permissionCode) {
        log.info("Permission {} revoked from user {}", permissionCode, userId);
    }

    @Override
    public Set<String> getRolePermissions(String role) {
        return ROLE_PERMISSIONS.getOrDefault(role, Set.of("profile.view", "profile.edit"));
    }
}
