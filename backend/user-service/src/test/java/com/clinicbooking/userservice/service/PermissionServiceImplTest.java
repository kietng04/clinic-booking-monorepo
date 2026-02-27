package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.exception.ResourceNotFoundException;
import com.clinicbooking.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PermissionServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PermissionServiceImpl permissionService;

    private User patientUser;
    private User doctorUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        patientUser = User.builder()
                .id(1L)
                .email("patient@test.com")
                .role(User.UserRole.PATIENT)
                .isActive(true)
                .build();

        doctorUser = User.builder()
                .id(2L)
                .email("doctor@test.com")
                .role(User.UserRole.DOCTOR)
                .isActive(true)
                .build();

        adminUser = User.builder()
                .id(3L)
                .email("admin@test.com")
                .role(User.UserRole.ADMIN)
                .isActive(true)
                .build();
    }

    @Test
    void getUserPermissions_forPatient_returnsPatientPermissions() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(patientUser));

        // Act
        Set<String> permissions = permissionService.getUserPermissions(1L);

        // Assert
        assertThat(permissions).isNotEmpty();
        assertThat(permissions).contains(
                "appointments.view_own",
                "appointments.create",
                "appointments.cancel",
                "medical_records.view",
                "profile.view",
                "profile.edit"
        );
        assertThat(permissions).doesNotContain("users.manage");
    }

    @Test
    void getUserPermissions_forDoctor_returnsDoctorPermissions() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(doctorUser));

        // Act
        Set<String> permissions = permissionService.getUserPermissions(2L);

        // Assert
        assertThat(permissions).isNotEmpty();
        assertThat(permissions).contains(
                "appointments.view_own",
                "appointments.view_all",
                "medical_records.create",
                "prescriptions.create",
                "profile.view",
                "profile.edit"
        );
    }

    @Test
    void getUserPermissions_forAdmin_returnsAdminPermissions() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(adminUser));

        // Act
        Set<String> permissions = permissionService.getUserPermissions(3L);

        // Assert
        assertThat(permissions).isNotEmpty();
        assertThat(permissions).contains(
                "appointments.view_all",
                "medical_records.view",
                "medical_records.create",
                "users.manage",
                "clinics.manage",
                "payments.process",
                "reports.view"
        );
    }

    @Test
    void getUserPermissions_withNonExistentUser_throwsException() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> permissionService.getUserPermissions(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void hasPermission_patientViewingOwnAppointments_returnsTrue() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(patientUser));

        // Act
        boolean result = permissionService.hasPermission(1L, "appointments.view_own");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    void hasPermission_patientManagingUsers_returnsFalse() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(patientUser));

        // Act
        boolean result = permissionService.hasPermission(1L, "users.manage");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    void hasPermission_doctorCreatingPrescriptions_returnsTrue() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(doctorUser));

        // Act
        boolean result = permissionService.hasPermission(2L, "prescriptions.create");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    void hasPermission_doctorManagingClinics_returnsFalse() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(doctorUser));

        // Act
        boolean result = permissionService.hasPermission(2L, "clinics.manage");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    void hasPermission_adminManagingUsers_returnsTrue() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(adminUser));

        // Act
        boolean result = permissionService.hasPermission(3L, "users.manage");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    void getRolePermissions_forPatient_returnsCorrectPermissions() {
        // Act
        Set<String> permissions = permissionService.getRolePermissions("PATIENT");

        // Assert
        assertThat(permissions).contains("appointments.view_own", "profile.view");
    }

    @Test
    void getRolePermissions_forDoctor_returnsCorrectPermissions() {
        // Act
        Set<String> permissions = permissionService.getRolePermissions("DOCTOR");

        // Assert
        assertThat(permissions).contains("appointments.view_all", "prescriptions.create");
    }

    @Test
    void getRolePermissions_forReceptionist_returnsCorrectPermissions() {
        // Act
        Set<String> permissions = permissionService.getRolePermissions("RECEPTIONIST");

        // Assert
        assertThat(permissions).contains(
                "appointments.view_all",
                "appointments.create",
                "appointments.check_in"
        );
    }

    @Test
    void getRolePermissions_forNurse_returnsCorrectPermissions() {
        // Act
        Set<String> permissions = permissionService.getRolePermissions("NURSE");

        // Assert
        assertThat(permissions).contains(
                "appointments.view_all",
                "appointments.check_in",
                "medical_records.view"
        );
    }

    @Test
    void getRolePermissions_forLabTechnician_returnsCorrectPermissions() {
        // Act
        Set<String> permissions = permissionService.getRolePermissions("LAB_TECHNICIAN");

        // Assert
        assertThat(permissions).contains("lab_tests.view", "lab_tests.update");
    }

    @Test
    void getRolePermissions_forPharmacist_returnsCorrectPermissions() {
        // Act
        Set<String> permissions = permissionService.getRolePermissions("PHARMACIST");

        // Assert
        assertThat(permissions).contains("prescriptions.view", "medications.manage");
    }

    @Test
    void getRolePermissions_forUnknownRole_returnsDefaultPermissions() {
        // Act
        Set<String> permissions = permissionService.getRolePermissions("UNKNOWN_ROLE");

        // Assert
        assertThat(permissions).contains("profile.view", "profile.edit");
        assertThat(permissions).hasSize(2);
    }

    @Test
    void grantPermission_logsAction() {
        // Act
        permissionService.grantPermission(1L, "new.permission");

        // Assert - Should not throw exception (currently just logs)
        verify(userRepository, never()).findById(anyLong());
    }

    @Test
    void revokePermission_logsAction() {
        // Act
        permissionService.revokePermission(1L, "some.permission");

        // Assert - Should not throw exception (currently just logs)
        verify(userRepository, never()).findById(anyLong());
    }

    @Test
    void getUserPermissions_allRolesHaveProfilePermissions() {
        // Arrange & Act & Assert for each role
        when(userRepository.findById(1L)).thenReturn(Optional.of(patientUser));
        assertThat(permissionService.getUserPermissions(1L)).contains("profile.view", "profile.edit");

        when(userRepository.findById(2L)).thenReturn(Optional.of(doctorUser));
        assertThat(permissionService.getUserPermissions(2L)).contains("profile.view", "profile.edit");

        when(userRepository.findById(3L)).thenReturn(Optional.of(adminUser));
        assertThat(permissionService.getUserPermissions(3L)).contains("profile.view", "profile.edit");
    }
}
