package com.clinicbooking.medicalservice.repository;

import com.clinicbooking.medicalservice.entity.MedicalRecord;
import com.clinicbooking.medicalservice.entity.Prescription;
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
@DisplayName("Prescription Repository Tests")
class PrescriptionRepositoryTest {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    private MedicalRecord testMedicalRecord1;
    private MedicalRecord testMedicalRecord2;
    private Prescription testPrescription1;
    private Prescription testPrescription2;
    private Prescription testPrescription3;

    @BeforeEach
    void setUp() {
        prescriptionRepository.deleteAll();
        medicalRecordRepository.deleteAll();

        // Create medical records
        testMedicalRecord1 = MedicalRecord.builder()
                .patientId(100L)
                .doctorId(200L)
                .patientName("Patient A")
                .doctorName("Dr. B")
                .diagnosis("Hypertension")
                .build();

        testMedicalRecord2 = MedicalRecord.builder()
                .patientId(101L)
                .doctorId(200L)
                .patientName("Patient C")
                .doctorName("Dr. B")
                .diagnosis("Diabetes")
                .build();

        testMedicalRecord1 = medicalRecordRepository.save(testMedicalRecord1);
        testMedicalRecord2 = medicalRecordRepository.save(testMedicalRecord2);

        // Create prescriptions
        testPrescription1 = Prescription.builder()
                .medicalRecord(testMedicalRecord1)
                .doctorId(200L)
                .doctorName("Dr. B")
                .medicationName("Lisinopril")
                .dosage("10mg")
                .frequency("Once daily")
                .duration("30 days")
                .instructions("Take in the morning")
                .build();

        testPrescription2 = Prescription.builder()
                .medicalRecord(testMedicalRecord1)
                .doctorId(200L)
                .doctorName("Dr. B")
                .medicationName("Hydrochlorothiazide")
                .dosage("25mg")
                .frequency("Once daily")
                .duration("30 days")
                .build();

        testPrescription3 = Prescription.builder()
                .medicalRecord(testMedicalRecord2)
                .doctorId(200L)
                .doctorName("Dr. B")
                .medicationName("Metformin")
                .dosage("500mg")
                .frequency("Twice daily")
                .duration("90 days")
                .instructions("Take with meals")
                .build();

        testPrescription1 = prescriptionRepository.save(testPrescription1);
        testPrescription2 = prescriptionRepository.save(testPrescription2);
        testPrescription3 = prescriptionRepository.save(testPrescription3);
    }

    @Test
    @DisplayName("Should save prescription with all required fields")
    void testSavePrescription() {
        Prescription newPrescription = Prescription.builder()
                .medicalRecord(testMedicalRecord1)
                .doctorId(200L)
                .doctorName("Dr. B")
                .medicationName("Aspirin")
                .dosage("100mg")
                .frequency("Once daily")
                .duration("Ongoing")
                .build();

        Prescription saved = prescriptionRepository.save(newPrescription);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getMedicationName()).isEqualTo("Aspirin");
        assertThat(saved.getDoctorId()).isEqualTo(200L);
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should find prescription by ID")
    void testFindById() {
        Optional<Prescription> found = prescriptionRepository.findById(testPrescription1.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getMedicationName()).isEqualTo("Lisinopril");
        assertThat(found.get().getDosage()).isEqualTo("10mg");
    }

    @Test
    @DisplayName("Should return empty when prescription ID not found")
    void testFindByIdNotFound() {
        Optional<Prescription> found = prescriptionRepository.findById(99999L);
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should find all prescriptions by medical record ID")
    void testFindByMedicalRecordId() {
        List<Prescription> prescriptions = prescriptionRepository
                .findByMedicalRecordId(testMedicalRecord1.getId());

        assertThat(prescriptions).hasSize(2);
        assertThat(prescriptions)
                .extracting(Prescription::getMedicationName)
                .containsExactlyInAnyOrder("Lisinopril", "Hydrochlorothiazide");
    }

    @Test
    @DisplayName("Should return empty list when no prescriptions for medical record")
    void testFindByMedicalRecordIdNoResults() {
        List<Prescription> prescriptions = prescriptionRepository.findByMedicalRecordId(99999L);
        assertThat(prescriptions).isEmpty();
    }

    @Test
    @DisplayName("Should find prescriptions by medical record ID with pagination")
    void testFindByMedicalRecordIdPageable() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Prescription> page = prescriptionRepository
                .findByMedicalRecordId(testMedicalRecord1.getId(), pageable);

        assertThat(page.getContent()).hasSize(2);
        assertThat(page.getTotalElements()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should correctly handle pagination for prescriptions")
    void testPagination() {
        // Request first page with size 1
        Pageable firstPage = PageRequest.of(0, 1);
        Page<Prescription> page1 = prescriptionRepository
                .findByMedicalRecordId(testMedicalRecord1.getId(), firstPage);

        assertThat(page1.getContent()).hasSize(1);
        assertThat(page1.getTotalElements()).isEqualTo(2);
        assertThat(page1.getTotalPages()).isEqualTo(2);
        assertThat(page1.hasNext()).isTrue();

        // Request second page
        Pageable secondPage = PageRequest.of(1, 1);
        Page<Prescription> page2 = prescriptionRepository
                .findByMedicalRecordId(testMedicalRecord1.getId(), secondPage);

        assertThat(page2.getContent()).hasSize(1);
        assertThat(page2.hasNext()).isFalse();
    }

    @Test
    @DisplayName("Should find all prescriptions by doctor ID")
    void testFindByDoctorId() {
        List<Prescription> prescriptions = prescriptionRepository.findByDoctorId(200L);

        assertThat(prescriptions).hasSize(3);
        assertThat(prescriptions)
                .extracting(Prescription::getDoctorId)
                .containsOnly(200L);
    }

    @Test
    @DisplayName("Should return empty list when no prescriptions for doctor")
    void testFindByDoctorIdNoResults() {
        List<Prescription> prescriptions = prescriptionRepository.findByDoctorId(99999L);
        assertThat(prescriptions).isEmpty();
    }

    @Test
    @DisplayName("Should update prescription successfully")
    void testUpdatePrescription() {
        Prescription prescription = prescriptionRepository.findById(testPrescription1.getId()).orElseThrow();

        prescription.setDosage("20mg");
        prescription.setFrequency("Twice daily");
        prescription.setNotes("Dosage increased");

        Prescription updated = prescriptionRepository.save(prescription);

        assertThat(updated.getDosage()).isEqualTo("20mg");
        assertThat(updated.getFrequency()).isEqualTo("Twice daily");
        assertThat(updated.getNotes()).isEqualTo("Dosage increased");
    }

    @Test
    @DisplayName("Should delete prescription successfully")
    void testDeletePrescription() {
        Long prescriptionId = testPrescription1.getId();
        prescriptionRepository.deleteById(prescriptionId);

        Optional<Prescription> deleted = prescriptionRepository.findById(prescriptionId);
        assertThat(deleted).isEmpty();
    }

    @Test
    @DisplayName("Should verify prescriptions are linked to medical record")
    void testPrescriptionMedicalRecordRelationship() {
        Long medicalRecordId = testMedicalRecord1.getId();

        // Verify prescriptions exist for medical record
        List<Prescription> prescriptions = prescriptionRepository
                .findByMedicalRecordId(medicalRecordId);
        assertThat(prescriptions).hasSize(2);

        // Verify each prescription is properly linked
        for (Prescription prescription : prescriptions) {
            assertThat(prescription.getMedicalRecord()).isNotNull();
            assertThat(prescription.getMedicalRecord().getId()).isEqualTo(medicalRecordId);
        }

        // Note: Actual cascade delete behavior is tested in integration tests with full JPA context
        // In @DataJpaTest, orphanRemoval works differently than in full application context
    }

    @Test
    @DisplayName("Should maintain relationship between prescription and medical record")
    void testRelationship() {
        Prescription prescription = prescriptionRepository.findById(testPrescription1.getId()).orElseThrow();

        assertThat(prescription.getMedicalRecord()).isNotNull();
        assertThat(prescription.getMedicalRecord().getId()).isEqualTo(testMedicalRecord1.getId());
        assertThat(prescription.getMedicalRecord().getPatientId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("Should handle prescriptions with optional fields")
    void testOptionalFields() {
        Prescription minimalPrescription = Prescription.builder()
                .medicalRecord(testMedicalRecord2)
                .doctorId(200L)
                .doctorName("Dr. B")
                .medicationName("Paracetamol")
                .build();

        Prescription saved = prescriptionRepository.save(minimalPrescription);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getMedicationName()).isEqualTo("Paracetamol");
        assertThat(saved.getDosage()).isNull();
        assertThat(saved.getFrequency()).isNull();
        assertThat(saved.getDuration()).isNull();
        assertThat(saved.getInstructions()).isNull();
    }
}
