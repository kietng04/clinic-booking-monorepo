package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.Clinic;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ClinicRepositoryTest {

    @Autowired
    private ClinicRepository clinicRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Clinic clinic1;
    private Clinic clinic2;
    private Clinic clinic3;

    @BeforeEach
    void setUp() {
        // Clear all clinics
        clinicRepository.deleteAll();

        // Create test clinics
        clinic1 = Clinic.builder()
                .name("City Medical Center")
                .address("123 Main St, City")
                .phone("0123456789")
                .email("contact@citymedical.com")
                .description("General healthcare services")
                .openingHours("Mon-Fri: 8:00-18:00")
                .isActive(true)
                .build();

        clinic2 = Clinic.builder()
                .name("Downtown Clinic")
                .address("456 Park Ave, Downtown")
                .phone("0987654321")
                .email("info@downtown.com")
                .description("Specialized medical services")
                .openingHours("Mon-Sat: 9:00-20:00")
                .isActive(true)
                .build();

        clinic3 = Clinic.builder()
                .name("Sunset Medical Clinic")
                .address("789 Sunset Blvd")
                .phone("0111222333")
                .email("contact@sunset.com")
                .description("Family healthcare")
                .openingHours("Mon-Sun: 7:00-22:00")
                .isActive(false)
                .build();

        clinic1 = entityManager.persistAndFlush(clinic1);
        clinic2 = entityManager.persistAndFlush(clinic2);
        clinic3 = entityManager.persistAndFlush(clinic3);
    }

    @Test
    void testFindByIsActiveTrue() {
        // When
        List<Clinic> result = clinicRepository.findByIsActiveTrue();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).extracting(Clinic::getIsActive)
                .containsOnly(true);
        assertThat(result).extracting(Clinic::getName)
                .contains("City Medical Center", "Downtown Clinic");
    }

    @Test
    void testFindByNameContainingIgnoreCase() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Clinic> result = clinicRepository.findByNameContainingIgnoreCase("medical", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting(Clinic::getName)
                .contains("City Medical Center", "Sunset Medical Clinic");
    }

    @Test
    void testFindByNameContainingIgnoreCase_CaseInsensitive() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Clinic> result = clinicRepository.findByNameContainingIgnoreCase("MEDICAL", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    void testFindByNameContainingIgnoreCase_NotFound() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Clinic> result = clinicRepository.findByNameContainingIgnoreCase("NonExistent", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void testSaveAndFindById() {
        // Given
        Clinic newClinic = Clinic.builder()
                .name("New Health Center")
                .address("999 New St")
                .phone("0444555666")
                .email("new@health.com")
                .description("Modern healthcare facility")
                .openingHours("24/7")
                .isActive(true)
                .build();

        // When
        Clinic saved = clinicRepository.save(newClinic);
        Clinic found = clinicRepository.findById(saved.getId()).orElse(null);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(found).isNotNull();
        assertThat(found.getName()).isEqualTo("New Health Center");
        assertThat(found.getPhone()).isEqualTo("0444555666");
    }

    @Test
    void testUpdateClinic() {
        // Given
        Clinic clinic = clinic1;
        String newName = "Updated Medical Center";
        String newPhone = "0999888777";

        // When
        clinic.setName(newName);
        clinic.setPhone(newPhone);
        Clinic updated = clinicRepository.save(clinic);

        // Then
        assertThat(updated.getName()).isEqualTo(newName);
        assertThat(updated.getPhone()).isEqualTo(newPhone);

        // Verify in database
        Clinic found = clinicRepository.findById(clinic.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getName()).isEqualTo(newName);
        assertThat(found.getPhone()).isEqualTo(newPhone);
    }

    @Test
    void testToggleClinicStatus() {
        // Given
        Clinic clinic = clinic1;
        assertThat(clinic.getIsActive()).isTrue();

        // When
        clinic.setIsActive(false);
        Clinic updated = clinicRepository.save(clinic);

        // Then
        assertThat(updated.getIsActive()).isFalse();

        // Verify in database
        Clinic found = clinicRepository.findById(clinic.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getIsActive()).isFalse();
    }

    @Test
    void testDeleteClinic() {
        // Given
        Long clinicId = clinic1.getId();

        // When
        clinicRepository.deleteById(clinicId);
        boolean exists = clinicRepository.existsById(clinicId);

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void testFindAll() {
        // When
        List<Clinic> result = clinicRepository.findAll();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    void testFindByNameContainingIgnoreCase_WithPagination() {
        // Given
        Pageable pageable = PageRequest.of(0, 1); // Only 1 result per page

        // When
        Page<Clinic> result = clinicRepository.findByNameContainingIgnoreCase("clinic", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(2); // Total matches
        assertThat(result.getTotalPages()).isEqualTo(2); // Total pages
    }

    @Test
    void testFindById_NotFound() {
        // When
        var found = clinicRepository.findById(999L);

        // Then
        assertThat(found).isEmpty();
    }
}
