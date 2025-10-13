package com.clinicbooking.consultationservice.repository;

import com.clinicbooking.consultationservice.entity.Consultation;
import com.clinicbooking.consultationservice.entity.ConsultationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for ConsultationRepository
 */
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("ConsultationRepository Tests")
class ConsultationRepositoryTest {

    @Autowired
    private ConsultationRepository consultationRepository;

    private Consultation testConsultation1;
    private Consultation testConsultation2;
    private Consultation testConsultation3;

    @BeforeEach
    void setUp() {
        consultationRepository.deleteAll();

        testConsultation1 = Consultation.builder()
                .patientId(1L)
                .patientName("John Doe")
                .doctorId(10L)
                .doctorName("Dr. Smith")
                .specialization("Cardiology")
                .topic("Heart pain consultation")
                .description("Experiencing chest pain for 2 days")
                .status(ConsultationStatus.PENDING)
                .fee(new BigDecimal("200000"))
                .isPaid(false)
                .build();

        testConsultation2 = Consultation.builder()
                .patientId(1L)
                .patientName("John Doe")
                .doctorId(11L)
                .doctorName("Dr. Johnson")
                .specialization("Dermatology")
                .topic("Skin rash")
                .description("Red rash on arms")
                .status(ConsultationStatus.ACCEPTED)
                .fee(new BigDecimal("150000"))
                .isPaid(true)
                .paymentId("PAY123")
                .acceptedAt(LocalDateTime.now())
                .build();

        testConsultation3 = Consultation.builder()
                .patientId(2L)
                .patientName("Jane Smith")
                .doctorId(10L)
                .doctorName("Dr. Smith")
                .specialization("Cardiology")
                .topic("Follow-up consultation")
                .description("Follow up on previous treatment")
                .status(ConsultationStatus.IN_PROGRESS)
                .fee(new BigDecimal("200000"))
                .isPaid(true)
                .startedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should save consultation successfully")
    void shouldSaveConsultation() {
        // When
        Consultation saved = consultationRepository.save(testConsultation1);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getPatientId()).isEqualTo(1L);
        assertThat(saved.getDoctorId()).isEqualTo(10L);
        assertThat(saved.getStatus()).isEqualTo(ConsultationStatus.PENDING);
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should find consultation by ID")
    void shouldFindConsultationById() {
        // Given
        Consultation saved = consultationRepository.save(testConsultation1);

        // When
        Optional<Consultation> found = consultationRepository.findById(saved.getId());

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
        assertThat(found.get().getTopic()).isEqualTo("Heart pain consultation");
    }

    @Test
    @DisplayName("Should find consultations by patient ID ordered by created date")
    void shouldFindByPatientIdOrderByCreatedAtDesc() {
        // Given
        consultationRepository.save(testConsultation1);
        consultationRepository.save(testConsultation2);
        consultationRepository.save(testConsultation3);

        // When
        Page<Consultation> result = consultationRepository.findByPatientIdOrderByCreatedAtDesc(
                1L, PageRequest.of(0, 10));

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getPatientId()).isEqualTo(1L);
        assertThat(result.getContent().get(1).getPatientId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should find consultations by doctor ID ordered by created date")
    void shouldFindByDoctorIdOrderByCreatedAtDesc() {
        // Given
        consultationRepository.save(testConsultation1);
        consultationRepository.save(testConsultation2);
        consultationRepository.save(testConsultation3);

        // When
        Page<Consultation> result = consultationRepository.findByDoctorIdOrderByCreatedAtDesc(
                10L, PageRequest.of(0, 10));

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getDoctorId()).isEqualTo(10L);
        assertThat(result.getContent().get(1).getDoctorId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("Should find consultations by patient ID and status")
    void shouldFindByPatientIdAndStatus() {
        // Given
        consultationRepository.save(testConsultation1);
        consultationRepository.save(testConsultation2);

        // When
        List<Consultation> result = consultationRepository.findByPatientIdAndStatus(
                1L, ConsultationStatus.PENDING);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(ConsultationStatus.PENDING);
        assertThat(result.get(0).getPatientId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should find consultations by doctor ID and status")
    void shouldFindByDoctorIdAndStatus() {
        // Given
        consultationRepository.save(testConsultation1);
        consultationRepository.save(testConsultation2);
        consultationRepository.save(testConsultation3);

        // When
        List<Consultation> result = consultationRepository.findByDoctorIdAndStatus(
                10L, ConsultationStatus.PENDING);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(ConsultationStatus.PENDING);
    }

    @Test
    @DisplayName("Should find pending consultations by doctor")
    void shouldFindPendingConsultationsByDoctor() {
        // Given
        consultationRepository.save(testConsultation1);
        consultationRepository.save(testConsultation2);
        consultationRepository.save(testConsultation3);

        // When
        List<Consultation> result = consultationRepository.findPendingConsultationsByDoctor(10L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(ConsultationStatus.PENDING);
        assertThat(result.get(0).getDoctorId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("Should find active consultations by doctor")
    void shouldFindActiveConsultationsByDoctor() {
        // Given
        consultationRepository.save(testConsultation1);
        consultationRepository.save(testConsultation2);
        consultationRepository.save(testConsultation3);

        // When
        List<Consultation> result = consultationRepository.findActiveConsultationsByDoctor(10L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(ConsultationStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("Should find active consultations by patient")
    void shouldFindActiveConsultationsByPatient() {
        // Given
        consultationRepository.save(testConsultation1);
        consultationRepository.save(testConsultation2);

        // When
        List<Consultation> result = consultationRepository.findActiveConsultationsByPatient(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(ConsultationStatus.ACCEPTED);
    }

    @Test
    @DisplayName("Should count consultations by doctor and status")
    void shouldCountByDoctorIdAndStatus() {
        // Given
        consultationRepository.save(testConsultation1);
        consultationRepository.save(testConsultation3);

        // When
        Long count = consultationRepository.countByDoctorIdAndStatus(
                10L, ConsultationStatus.PENDING);

        // Then
        assertThat(count).isEqualTo(1);
    }

    @Test
    @DisplayName("Should count consultations by patient")
    void shouldCountByPatientId() {
        // Given
        consultationRepository.save(testConsultation1);
        consultationRepository.save(testConsultation2);

        // When
        Long count = consultationRepository.countByPatientId(1L);

        // Then
        assertThat(count).isEqualTo(2);
    }

    @Test
    @DisplayName("Should find consultations by date range")
    void shouldFindByDateRange() {
        // Given
        consultationRepository.save(testConsultation1);
        consultationRepository.save(testConsultation2);
        consultationRepository.save(testConsultation3);

        LocalDateTime startDate = LocalDateTime.now().minusDays(1);
        LocalDateTime endDate = LocalDateTime.now().plusDays(1);

        // When
        List<Consultation> result = consultationRepository.findByDateRange(startDate, endDate);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should find consultations by doctor, status and date")
    void shouldFindByDoctorAndStatusAndDateAfter() {
        // Given
        consultationRepository.save(testConsultation1);
        consultationRepository.save(testConsultation3);

        LocalDateTime startDate = LocalDateTime.now().minusDays(1);

        // When
        List<Consultation> result = consultationRepository.findByDoctorAndStatusAndDateAfter(
                10L, ConsultationStatus.PENDING, startDate);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(ConsultationStatus.PENDING);
    }

    @Test
    @DisplayName("Should search consultations by keyword")
    void shouldSearchConsultations() {
        // Given
        consultationRepository.save(testConsultation1);
        consultationRepository.save(testConsultation2);
        consultationRepository.save(testConsultation3);

        // When
        List<Consultation> result = consultationRepository.searchConsultations("heart", 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTopic()).containsIgnoringCase("heart");
    }

    @Test
    @DisplayName("Should update consultation status")
    void shouldUpdateConsultationStatus() {
        // Given
        Consultation saved = consultationRepository.save(testConsultation1);

        // When
        saved.setStatus(ConsultationStatus.ACCEPTED);
        saved.setAcceptedAt(LocalDateTime.now());
        Consultation updated = consultationRepository.save(saved);

        // Then
        assertThat(updated.getStatus()).isEqualTo(ConsultationStatus.ACCEPTED);
        assertThat(updated.getAcceptedAt()).isNotNull();
        assertThat(updated.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should delete consultation")
    void shouldDeleteConsultation() {
        // Given
        Consultation saved = consultationRepository.save(testConsultation1);
        Long id = saved.getId();

        // When
        consultationRepository.deleteById(id);
        Optional<Consultation> found = consultationRepository.findById(id);

        // Then
        assertThat(found).isEmpty();
    }
}
