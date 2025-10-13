package com.clinicbooking.userservice.service;

import java.util.Set;

public interface PermissionService {
    Set<String> getUserPermissions(Long userId);
    boolean hasPermission(Long userId, String permissionCode);
    void grantPermission(Long userId, String permissionCode);
    void revokePermission(Long userId, String permissionCode);
    Set<String> getRolePermissions(String role);
}
