package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.MedicalService;
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
class MedicalServiceRepositoryTest {

    @Autowired
    private MedicalServiceRepository medicalServiceRepository;

    @Autowired
    private TestEntityManager entityManager;

    private MedicalService service1;
    private MedicalService service2;
    private MedicalService service3;
    private MedicalService service4;

    @BeforeEach
    void setUp() {
        // Clear all services
        medicalServiceRepository.deleteAll();

        // Create test services
        service1 = MedicalService.builder()
                .clinicId(1L)
                .name("General Consultation")
                .description("General medical consultation")
                .category(MedicalService.ServiceCategory.GENERAL)
                .durationMinutes(30)
                .isActive(true)
                .build();

        service2 = MedicalService.builder()
                .clinicId(1L)
                .name("Cardiology Consultation")
                .description("Heart specialist consultation")
                .category(MedicalService.ServiceCategory.SPECIALIST)
                .durationMinutes(45)
                .isActive(true)
                .build();

        service3 = MedicalService.builder()
                .clinicId(2L)
                .name("Blood Test")
                .description("Complete blood count test")
                .category(MedicalService.ServiceCategory.LAB)
                .durationMinutes(15)
                .isActive(true)
                .build();

        service4 = MedicalService.builder()
                .clinicId(1L)
                .name("X-Ray Imaging")
                .description("Digital X-Ray imaging service")
                .category(MedicalService.ServiceCategory.IMAGING)
                .durationMinutes(20)
                .isActive(false)
                .build();

        service1 = entityManager.persistAndFlush(service1);
        service2 = entityManager.persistAndFlush(service2);
        service3 = entityManager.persistAndFlush(service3);
        service4 = entityManager.persistAndFlush(service4);
    }

    @Test
    void testFindByClinicId() {
        // When
        List<MedicalService> result = medicalServiceRepository.findByClinicId(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).extracting(MedicalService::getClinicId)
                .containsOnly(1L);
    }

    @Test
    void testFindByClinicId_NotFound() {
        // When
        List<MedicalService> result = medicalServiceRepository.findByClinicId(999L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void testFindByClinicIdAndIsActiveTrue() {
        // When
        List<MedicalService> result = medicalServiceRepository.findByClinicIdAndIsActiveTrue(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).extracting(MedicalService::getClinicId).containsOnly(1L);
        assertThat(result).extracting(MedicalService::getIsActive).containsOnly(true);
        assertThat(result).extracting(MedicalService::getName)
                .contains("General Consultation", "Cardiology Consultation");
    }

    @Test
    void testFindByClinicIdAndIsActiveTrue_NoActiveServices() {
        // Given - Add inactive service to clinic 3
        MedicalService inactiveService = MedicalService.builder()
                .clinicId(3L)
                .name("Inactive Service")
                .description("Test")
                .category(MedicalService.ServiceCategory.GENERAL)
                .durationMinutes(30)
                .isActive(false)
                .build();
        entityManager.persistAndFlush(inactiveService);

        // When
        List<MedicalService> result = medicalServiceRepository.findByClinicIdAndIsActiveTrue(3L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void testFindByCategoryAndIsActiveTrue() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<MedicalService> result = medicalServiceRepository
                .findByCategoryAndIsActiveTrue(MedicalService.ServiceCategory.GENERAL, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCategory())
                .isEqualTo(MedicalService.ServiceCategory.GENERAL);
        assertThat(result.getContent().get(0).getIsActive()).isTrue();
    }

    @Test
    void testFindByCategoryAndIsActiveTrue_MultipleResults() {
        // Given - Add another SPECIALIST service
        MedicalService specialistService = MedicalService.builder()
                .clinicId(2L)
                .name("Neurology Consultation")
                .description("Brain specialist consultation")
                .category(MedicalService.ServiceCategory.SPECIALIST)
                .durationMinutes(60)
                .isActive(true)
                .build();
        entityManager.persistAndFlush(specialistService);

        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<MedicalService> result = medicalServiceRepository
                .findByCategoryAndIsActiveTrue(MedicalService.ServiceCategory.SPECIALIST, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    void testFindByNameContainingIgnoreCase() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<MedicalService> result = medicalServiceRepository
                .findByNameContainingIgnoreCase("consultation", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting(MedicalService::getName)
                .contains("General Consultation", "Cardiology Consultation");
    }

    @Test
    void testFindByNameContainingIgnoreCase_CaseInsensitive() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<MedicalService> result = medicalServiceRepository
                .findByNameContainingIgnoreCase("BLOOD", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Blood Test");
    }

    @Test
    void testFindByNameContainingIgnoreCase_NotFound() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<MedicalService> result = medicalServiceRepository
                .findByNameContainingIgnoreCase("NonExistent", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void testFindByNameContainingIgnoreCaseAndCategory() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<MedicalService> result = medicalServiceRepository
                .findByNameContainingIgnoreCaseAndCategory(
                        "consultation", MedicalService.ServiceCategory.SPECIALIST, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Cardiology Consultation");
        assertThat(result.getContent().get(0).getCategory())
                .isEqualTo(MedicalService.ServiceCategory.SPECIALIST);
    }

    @Test
    void testFindByNameContainingIgnoreCaseAndCategory_NoMatch() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<MedicalService> result = medicalServiceRepository
                .findByNameContainingIgnoreCaseAndCategory(
                        "consultation", MedicalService.ServiceCategory.LAB, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void testSaveAndFindById() {
        // Given
        MedicalService newService = MedicalService.builder()
                .clinicId(3L)
                .name("Ultrasound Scan")
                .description("Abdominal ultrasound imaging")
                .category(MedicalService.ServiceCategory.IMAGING)
                .durationMinutes(30)
                .isActive(true)
                .build();

        // When
        MedicalService saved = medicalServiceRepository.save(newService);
        MedicalService found = medicalServiceRepository.findById(saved.getId()).orElse(null);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(found).isNotNull();
        assertThat(found.getClinicId()).isEqualTo(3L);
        assertThat(found.getName()).isEqualTo("Ultrasound Scan");
        assertThat(found.getCategory()).isEqualTo(MedicalService.ServiceCategory.IMAGING);
    }

    @Test
    void testUpdateService() {
        // Given
        MedicalService service = service1;
        String newName = "Updated General Consultation";
        Integer newDuration = 45;

        // When
        service.setName(newName);
        service.setDurationMinutes(newDuration);
        MedicalService updated = medicalServiceRepository.save(service);

        // Then
        assertThat(updated.getName()).isEqualTo(newName);
        assertThat(updated.getDurationMinutes()).isEqualTo(newDuration);

        // Verify in database
        MedicalService found = medicalServiceRepository.findById(service.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getName()).isEqualTo(newName);
        assertThat(found.getDurationMinutes()).isEqualTo(newDuration);
    }

    @Test
    void testToggleServiceStatus() {
        // Given
        MedicalService service = service1;
        assertThat(service.getIsActive()).isTrue();

        // When
        service.setIsActive(false);
        MedicalService updated = medicalServiceRepository.save(service);

        // Then
        assertThat(updated.getIsActive()).isFalse();

        // Verify in database
        MedicalService found = medicalServiceRepository.findById(service.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getIsActive()).isFalse();
    }

    @Test
    void testDeleteService() {
        // Given
        Long serviceId = service1.getId();

        // When
        medicalServiceRepository.deleteById(serviceId);
        boolean exists = medicalServiceRepository.existsById(serviceId);

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void testFindAll() {
        // When
        List<MedicalService> result = medicalServiceRepository.findAll();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(4);
    }

    @Test
    void testServiceCategories() {
        // When
        MedicalService generalService = medicalServiceRepository.findById(service1.getId()).orElse(null);
        MedicalService specialistService = medicalServiceRepository.findById(service2.getId()).orElse(null);
        MedicalService labService = medicalServiceRepository.findById(service3.getId()).orElse(null);
        MedicalService imagingService = medicalServiceRepository.findById(service4.getId()).orElse(null);

        // Then
        assertThat(generalService).isNotNull();
        assertThat(generalService.getCategory()).isEqualTo(MedicalService.ServiceCategory.GENERAL);

        assertThat(specialistService).isNotNull();
        assertThat(specialistService.getCategory()).isEqualTo(MedicalService.ServiceCategory.SPECIALIST);

        assertThat(labService).isNotNull();
        assertThat(labService.getCategory()).isEqualTo(MedicalService.ServiceCategory.LAB);

        assertThat(imagingService).isNotNull();
        assertThat(imagingService.getCategory()).isEqualTo(MedicalService.ServiceCategory.IMAGING);
    }

    @Test
    void testFindById_NotFound() {
        // When
        var found = medicalServiceRepository.findById(999L);

        // Then
        assertThat(found).isEmpty();
    }
}
