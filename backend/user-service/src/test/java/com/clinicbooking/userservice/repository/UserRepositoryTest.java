package com.clinicbooking.userservice.repository;

import com.clinicbooking.userservice.entity.NotificationPreferences;
import com.clinicbooking.userservice.entity.NotificationReminderTiming;
import com.clinicbooking.userservice.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    private User doctor1;
    private User doctor2;
    private User doctor3;
    private User patient;

    @BeforeEach
    void setUp() {
        // Create test doctors with different attributes
        doctor1 = User.builder()
                .email("doctor1@test.com")
                .password("password123")
                .fullName("Dr. Sarah Johnson")
                .role(User.UserRole.DOCTOR)
                .specialization("Cardiology")
                .licenseNumber("LIC001")
                .workplace("City Hospital")
                .experienceYears(10)
                .rating(BigDecimal.valueOf(4.5))
                .consultationFee(BigDecimal.valueOf(500000))
                .isActive(true)
                .build();
        entityManager.persistAndFlush(doctor1);

        doctor2 = User.builder()
                .email("doctor2@test.com")
                .password("password123")
                .fullName("Dr. Michael Chen")
                .role(User.UserRole.DOCTOR)
                .specialization("Dermatology")
                .licenseNumber("LIC002")
                .workplace("Central Clinic")
                .experienceYears(8)
                .rating(BigDecimal.valueOf(4.8))
                .consultationFee(BigDecimal.valueOf(700000))
                .isActive(true)
                .build();
        entityManager.persistAndFlush(doctor2);

        doctor3 = User.builder()
                .email("doctor3@test.com")
                .password("password123")
                .fullName("Dr. Emily Davis")
                .role(User.UserRole.DOCTOR)
                .specialization("Pediatrics")
                .licenseNumber("LIC003")
                .workplace("Children Hospital")
                .experienceYears(5)
                .rating(BigDecimal.valueOf(4.2))
                .consultationFee(BigDecimal.valueOf(400000))
                .isActive(true)
                .build();
        entityManager.persistAndFlush(doctor3);

        // Create a patient (should not appear in doctor searches)
        patient = User.builder()
                .email("patient@test.com")
                .password("password123")
                .fullName("John Doe")
                .role(User.UserRole.PATIENT)
                .isActive(true)
                .build();
        entityManager.persistAndFlush(patient);

        entityManager.clear();
    }

    @Test
    void searchDoctors_withKeyword_findsMatchingDoctors() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        // Act - Search by name keyword
        Page<User> result = userRepository.searchDoctors(
                User.UserRole.DOCTOR,
                "Sarah",
                null,
                null,
                null,
                pageable
        );

        // Assert
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getFullName()).isEqualTo("Dr. Sarah Johnson");
    }

    @Test
    void searchDoctors_withSpecialization_filtersCorrectly() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        // Act - Filter by exact specialization
        Page<User> result = userRepository.searchDoctors(
                User.UserRole.DOCTOR,
                null,
                "Cardiology",
                null,
                null,
                pageable
        );

        // Assert
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getSpecialization()).isEqualToIgnoringCase("Cardiology");
    }

    @Test
    void searchDoctors_withMinRating_filtersCorrectly() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        BigDecimal minRating = BigDecimal.valueOf(4.5);

        // Act - Filter by minimum rating
        Page<User> result = userRepository.searchDoctors(
                User.UserRole.DOCTOR,
                null,
                null,
                minRating,
                null,
                pageable
        );

        // Assert
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent())
                .allMatch(doctor -> doctor.getRating().compareTo(minRating) >= 0);
    }

    @Test
    void searchDoctors_withMaxFee_filtersCorrectly() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        BigDecimal maxFee = BigDecimal.valueOf(500000);

        // Act - Filter by max consultation fee
        Page<User> result = userRepository.searchDoctors(
                User.UserRole.DOCTOR,
                null,
                null,
                null,
                maxFee,
                pageable
        );

        // Assert
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent())
                .allMatch(doctor -> doctor.getConsultationFee().compareTo(maxFee) <= 0);
    }

    @Test
    void searchDoctors_withAllFilters_appliesAllCriteria() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        // Act - Apply all filters together
        Page<User> result = userRepository.searchDoctors(
                User.UserRole.DOCTOR,
                "Dr",
                "Cardiology",
                BigDecimal.valueOf(4.0),
                BigDecimal.valueOf(600000),
                pageable
        );

        // Assert
        assertThat(result.getContent()).hasSize(1);
        User doctor = result.getContent().get(0);
        assertThat(doctor.getFullName()).contains("Dr");
        assertThat(doctor.getSpecialization()).isEqualToIgnoringCase("Cardiology");
        assertThat(doctor.getRating()).isGreaterThanOrEqualTo(BigDecimal.valueOf(4.0));
        assertThat(doctor.getConsultationFee()).isLessThanOrEqualTo(BigDecimal.valueOf(600000));
    }

    @Test
    void searchDoctors_withNoFilters_returnsAllDoctors() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        // Act - No filters
        Page<User> result = userRepository.searchDoctors(
                User.UserRole.DOCTOR,
                null,
                null,
                null,
                null,
                pageable
        );

        // Assert - Should return all 3 doctors, but not the patient
        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent())
                .allMatch(user -> user.getRole() == User.UserRole.DOCTOR);
    }

    @Test
    void searchDoctors_withBlankStringFilters_returnsAllDoctors() {
        Pageable pageable = PageRequest.of(0, 10);

        Page<User> result = userRepository.searchDoctors(
                User.UserRole.DOCTOR,
                "",
                "",
                null,
                null,
                pageable
        );

        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent())
                .allMatch(user -> user.getRole() == User.UserRole.DOCTOR);
    }

    @Test
    void searchDoctors_pagination_worksCorrectly() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 2);

        // Act - Get first page with size 2
        Page<User> result = userRepository.searchDoctors(
                User.UserRole.DOCTOR,
                null,
                null,
                null,
                null,
                pageable
        );

        // Assert
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(3);
        assertThat(result.getTotalPages()).isEqualTo(2);
        assertThat(result.hasNext()).isTrue();
    }

    @Test
    void findDistinctSpecializations_returnsUniqueList() {
        // Act
        List<String> specializations = userRepository.findDistinctSpecializations();

        // Assert
        assertThat(specializations).hasSize(3);
        assertThat(specializations).containsExactlyInAnyOrder(
                "Cardiology",
                "Dermatology",
                "Pediatrics"
        );
    }

    @Test
    void searchDoctors_caseInsensitiveKeyword_findsMatch() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        // Act - Search with lowercase keyword
        Page<User> result = userRepository.searchDoctors(
                User.UserRole.DOCTOR,
                "sarah",
                null,
                null,
                null,
                pageable
        );

        // Assert
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getFullName()).isEqualTo("Dr. Sarah Johnson");
    }

    @Test
    void searchDoctors_keywordInSpecialization_findsMatch() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        // Act - Search by specialization keyword
        Page<User> result = userRepository.searchDoctors(
                User.UserRole.DOCTOR,
                "Cardio",
                null,
                null,
                null,
                pageable
        );

        // Assert
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getSpecialization()).isEqualTo("Cardiology");
    }

    @Test
    void searchDoctors_onlyReturnsActiveDoctors() {
        // Arrange
        User inactiveDoctor = User.builder()
                .email("inactive@test.com")
                .password("password123")
                .fullName("Dr. Inactive")
                .role(User.UserRole.DOCTOR)
                .specialization("Surgery")
                .licenseNumber("LIC999")
                .isActive(false)
                .build();
        entityManager.persistAndFlush(inactiveDoctor);
        entityManager.clear();

        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<User> result = userRepository.searchDoctors(
                User.UserRole.DOCTOR,
                null,
                null,
                null,
                null,
                pageable
        );

        // Assert - Should still return only 3 active doctors
        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent()).allMatch(User::getIsActive);
    }

    @Test
    void saveAndReload_preservesNotificationPreferences() {
        User managedPatient = userRepository.findById(patient.getId()).orElseThrow();
        managedPatient.setNotificationPreferences(NotificationPreferences.builder()
                .emailReminders(false)
                .emailPrescription(true)
                .emailLabResults(false)
                .emailMarketing(true)
                .smsReminders(false)
                .smsUrgent(true)
                .pushAll(false)
                .reminderTiming(NotificationReminderTiming.TWO_HOURS)
                .build());
        entityManager.persistAndFlush(managedPatient);
        entityManager.clear();

        User reloadedPatient = userRepository.findById(patient.getId()).orElseThrow();

        assertThat(reloadedPatient.getNotificationPreferences().getEmailReminders()).isFalse();
        assertThat(reloadedPatient.getNotificationPreferences().getEmailMarketing()).isTrue();
        assertThat(reloadedPatient.getNotificationPreferences().getPushAll()).isFalse();
        assertThat(reloadedPatient.getNotificationPreferences().getReminderTiming())
                .isEqualTo(NotificationReminderTiming.TWO_HOURS);
    }
}
