package com.clinicbooking.medicalservice.repository;

import com.clinicbooking.medicalservice.entity.Medication;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("Medication Repository Tests")
class MedicationRepositoryTest {

    @Autowired
    private MedicationRepository medicationRepository;

    @BeforeEach
    void setUp() {
        medicationRepository.deleteAll();

        // Create test medications
        Medication med1 = Medication.builder()
                .name("Lisinopril")
                .genericName("Lisinopril")
                .category("Antihypertensive")
                .unit("mg")
                .defaultDosage("10mg")
                .defaultFrequency("Once daily")
                .defaultDuration("30 days")
                .instructions("Take in the morning")
                .isActive(true)
                .build();

        Medication med2 = Medication.builder()
                .name("Metformin")
                .genericName("Metformin HCL")
                .category("Antidiabetic")
                .unit("mg")
                .defaultDosage("500mg")
                .defaultFrequency("Twice daily")
                .defaultDuration("90 days")
                .instructions("Take with meals")
                .isActive(true)
                .build();

        Medication med3 = Medication.builder()
                .name("Aspirin")
                .genericName("Acetylsalicylic acid")
                .category("Analgesic")
                .unit("mg")
                .defaultDosage("100mg")
                .defaultFrequency("Once daily")
                .isActive(true)
                .build();

        Medication med4 = Medication.builder()
                .name("Discontinued Med")
                .genericName("Old Med")
                .category("Other")
                .isActive(false)
                .build();

        medicationRepository.save(med1);
        medicationRepository.save(med2);
        medicationRepository.save(med3);
        medicationRepository.save(med4);
    }

    @Test
    @DisplayName("Should save medication with all fields")
    void testSaveMedication() {
        Medication medication = Medication.builder()
                .name("Paracetamol")
                .genericName("Acetaminophen")
                .category("Analgesic")
                .unit("mg")
                .defaultDosage("500mg")
                .defaultFrequency("Every 6 hours")
                .isActive(true)
                .build();

        Medication saved = medicationRepository.save(medication);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Paracetamol");
        assertThat(saved.getIsActive()).isTrue();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should find medication by ID")
    void testFindById() {
        Medication saved = medicationRepository.save(Medication.builder()
                .name("Test Med")
                .isActive(true)
                .build());

        Optional<Medication> found = medicationRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test Med");
    }

    @Test
    @DisplayName("Should find all active medications ordered by name")
    void testFindByIsActiveTrueOrderByNameAsc() {
        List<Medication> activeMedications = medicationRepository.findByIsActiveTrueOrderByNameAsc();

        assertThat(activeMedications).hasSize(3);
        assertThat(activeMedications)
                .extracting(Medication::getName)
                .containsExactly("Aspirin", "Lisinopril", "Metformin");
        assertThat(activeMedications)
                .allMatch(Medication::getIsActive);
    }

    @Test
    @DisplayName("Should find medications by category")
    void testFindByCategoryAndIsActiveTrueOrderByNameAsc() {
        List<Medication> antihypertensives = medicationRepository
                .findByCategoryAndIsActiveTrueOrderByNameAsc("Antihypertensive");

        assertThat(antihypertensives).hasSize(1);
        assertThat(antihypertensives.get(0).getName()).isEqualTo("Lisinopril");
    }

    @Test
    @DisplayName("Should return empty list for non-existent category")
    void testFindByCategoryNoResults() {
        List<Medication> medications = medicationRepository
                .findByCategoryAndIsActiveTrueOrderByNameAsc("NonExistentCategory");

        assertThat(medications).isEmpty();
    }

    @Test
    @DisplayName("Should search medications by name case-insensitive")
    void testSearchByNameOrGenericName() {
        List<Medication> results = medicationRepository.searchByNameOrGenericName("lisin");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Lisinopril");
    }

    @Test
    @DisplayName("Should search medications by generic name")
    void testSearchByGenericName() {
        List<Medication> results = medicationRepository.searchByNameOrGenericName("acetyl");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Aspirin");
    }

    @Test
    @DisplayName("Should return empty list when search has no matches")
    void testSearchNoResults() {
        List<Medication> results = medicationRepository.searchByNameOrGenericName("nonexistent");
        assertThat(results).isEmpty();
    }

    @Test
    @DisplayName("Should search with filters - all parameters")
    void testFindWithFiltersAllParams() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Medication> results = medicationRepository.findWithFilters(
                "met", "Antidiabetic", true, pageable);

        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getName()).isEqualTo("Metformin");
    }

    @Test
    @DisplayName("Should search with filters - only search parameter")
    void testFindWithFiltersSearchOnly() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Medication> results = medicationRepository.findWithFilters(
                "asp", null, null, pageable);

        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getName()).isEqualTo("Aspirin");
    }

    @Test
    @DisplayName("Should search with filters - only category parameter")
    void testFindWithFiltersCategoryOnly() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Medication> results = medicationRepository.findWithFilters(
                null, "Analgesic", null, pageable);

        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getName()).isEqualTo("Aspirin");
    }

    @Test
    @DisplayName("Should search with filters - include inactive medications")
    void testFindWithFiltersIncludeInactive() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Medication> results = medicationRepository.findWithFilters(
                null, null, false, pageable);

        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getName()).isEqualTo("Discontinued Med");
        assertThat(results.getContent().get(0).getIsActive()).isFalse();
    }

    @Test
    @DisplayName("Should search with filters - all medications when no filters")
    void testFindWithFiltersNoFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Medication> results = medicationRepository.findWithFilters(
                null, null, null, pageable);

        assertThat(results.getContent()).hasSize(4);
    }

    @Test
    @DisplayName("Should get distinct categories")
    void testFindDistinctCategories() {
        List<String> categories = medicationRepository.findDistinctCategories();

        assertThat(categories).hasSize(4);
        assertThat(categories).containsExactlyInAnyOrder(
                "Analgesic", "Antidiabetic", "Antihypertensive", "Other");
    }

    @Test
    @DisplayName("Should check if medication name exists case-insensitive")
    void testExistsByNameIgnoreCase() {
        boolean exists = medicationRepository.existsByNameIgnoreCase("lisinopril");
        assertThat(exists).isTrue();

        boolean existsUpperCase = medicationRepository.existsByNameIgnoreCase("LISINOPRIL");
        assertThat(existsUpperCase).isTrue();

        boolean notExists = medicationRepository.existsByNameIgnoreCase("NonExistent");
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should update medication successfully")
    void testUpdateMedication() {
        Medication medication = medicationRepository.findAll().get(0);
        Long medicationId = medication.getId();

        medication.setDefaultDosage("20mg");
        medication.setInstructions("Updated instructions");

        Medication updated = medicationRepository.save(medication);

        assertThat(updated.getId()).isEqualTo(medicationId);
        assertThat(updated.getDefaultDosage()).isEqualTo("20mg");
        assertThat(updated.getInstructions()).isEqualTo("Updated instructions");
        assertThat(updated.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should deactivate medication (soft delete)")
    void testDeactivateMedication() {
        Medication medication = medicationRepository.findAll().stream()
                .filter(Medication::getIsActive)
                .findFirst()
                .orElseThrow();

        medication.setIsActive(false);
        medicationRepository.save(medication);

        List<Medication> activeMeds = medicationRepository.findByIsActiveTrueOrderByNameAsc();
        assertThat(activeMeds).doesNotContain(medication);
    }

    @Test
    @DisplayName("Should handle medication with minimal required fields")
    void testSaveMinimalMedication() {
        Medication minimal = Medication.builder()
                .name("Minimal Med")
                .build();

        Medication saved = medicationRepository.save(minimal);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Minimal Med");
        assertThat(saved.getIsActive()).isTrue(); // Default value
        assertThat(saved.getUnit()).isEqualTo("viên"); // Default value
    }

    @Test
    @DisplayName("Should handle pagination correctly")
    void testPagination() {
        Pageable firstPage = PageRequest.of(0, 2);
        Page<Medication> page1 = medicationRepository.findWithFilters(
                null, null, true, firstPage);

        assertThat(page1.getContent()).hasSize(2);
        assertThat(page1.getTotalElements()).isEqualTo(3);
        assertThat(page1.getTotalPages()).isEqualTo(2);
        assertThat(page1.hasNext()).isTrue();

        Pageable secondPage = PageRequest.of(1, 2);
        Page<Medication> page2 = medicationRepository.findWithFilters(
                null, null, true, secondPage);

        assertThat(page2.getContent()).hasSize(1);
        assertThat(page2.hasNext()).isFalse();
    }
}
