package com.clinicbooking.medicalservice.repository;

import com.clinicbooking.medicalservice.entity.MedicalRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("MedicalRecord Repository Tests")
class MedicalRecordRepositoryTest {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    private MedicalRecord testRecord1;
    private MedicalRecord testRecord2;
    private MedicalRecord testRecord3;

    @BeforeEach
    void setUp() {
        medicalRecordRepository.deleteAll();

        // Create test data
        testRecord1 = MedicalRecord.builder()
                .patientId(100L)
                .doctorId(200L)
                .patientName("Nguyen Van A")
                .doctorName("Dr. Tran B")
                .appointmentId(1000L)
                .diagnosis("Hypertension")
                .symptoms("Headache, dizziness")
                .treatmentPlan("Medication and lifestyle changes")
                .notes("Follow up in 2 weeks")
                .followUpDate(LocalDate.now().plusDays(14))
                .build();

        testRecord2 = MedicalRecord.builder()
                .patientId(100L)
                .doctorId(201L)
                .patientName("Nguyen Van A")
                .doctorName("Dr. Le C")
                .appointmentId(1001L)
                .diagnosis("Common cold")
                .symptoms("Cough, fever")
                .treatmentPlan("Rest and fluids")
                .build();

        testRecord3 = MedicalRecord.builder()
                .patientId(101L)
                .doctorId(200L)
                .patientName("Tran Thi D")
                .doctorName("Dr. Tran B")
                .appointmentId(1002L)
                .diagnosis("Diabetes Type 2")
                .symptoms("Increased thirst, frequent urination")
                .treatmentPlan("Diet control and medication")
                .followUpDate(LocalDate.now().plusMonths(1))
                .build();

        testRecord1 = medicalRecordRepository.save(testRecord1);
        testRecord2 = medicalRecordRepository.save(testRecord2);
        testRecord3 = medicalRecordRepository.save(testRecord3);
    }

    @Test
    @DisplayName("Should save medical record with all required fields")
    void testSaveMedicalRecord() {
        MedicalRecord newRecord = MedicalRecord.builder()
                .patientId(102L)
                .doctorId(202L)
                .patientName("Test Patient")
                .doctorName("Test Doctor")
                .diagnosis("Test Diagnosis")
                .symptoms("Test Symptoms")
                .build();

        MedicalRecord saved = medicalRecordRepository.save(newRecord);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getPatientId()).isEqualTo(102L);
        assertThat(saved.getDoctorId()).isEqualTo(202L);
        assertThat(saved.getDiagnosis()).isEqualTo("Test Diagnosis");
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should find medical record by ID")
    void testFindById() {
        Optional<MedicalRecord> found = medicalRecordRepository.findById(testRecord1.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getPatientId()).isEqualTo(100L);
        assertThat(found.get().getDiagnosis()).isEqualTo("Hypertension");
    }

    @Test
    @DisplayName("Should return empty when medical record ID not found")
    void testFindByIdNotFound() {
        Optional<MedicalRecord> found = medicalRecordRepository.findById(99999L);
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should find all medical records by patient ID with pagination")
    void testFindByPatientId() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<MedicalRecord> records = medicalRecordRepository.findByPatientId(100L, pageable);

        assertThat(records).isNotNull();
        assertThat(records.getContent()).hasSize(2);
        assertThat(records.getContent())
                .extracting(MedicalRecord::getPatientId)
                .containsOnly(100L);
    }

    @Test
    @DisplayName("Should return empty page when no records for patient")
    void testFindByPatientIdNoRecords() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<MedicalRecord> records = medicalRecordRepository.findByPatientId(99999L, pageable);

        assertThat(records).isNotNull();
        assertThat(records.getContent()).isEmpty();
    }

    @Test
    @DisplayName("Should find all medical records by doctor ID with pagination")
    void testFindByDoctorId() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<MedicalRecord> records = medicalRecordRepository.findByDoctorId(200L, pageable);

        assertThat(records).isNotNull();
        assertThat(records.getContent()).hasSize(2);
        assertThat(records.getContent())
                .extracting(MedicalRecord::getDoctorId)
                .containsOnly(200L);
    }

    @Test
    @DisplayName("Should return empty page when no records for doctor")
    void testFindByDoctorIdNoRecords() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<MedicalRecord> records = medicalRecordRepository.findByDoctorId(99999L, pageable);

        assertThat(records).isNotNull();
        assertThat(records.getContent()).isEmpty();
    }

    @Test
    @DisplayName("Should find medical record by appointment ID")
    void testFindByAppointmentId() {
        Optional<MedicalRecord> found = medicalRecordRepository.findByAppointmentId(1000L);

        assertThat(found).isPresent();
        assertThat(found.get().getAppointmentId()).isEqualTo(1000L);
        assertThat(found.get().getPatientId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("Should return empty when appointment ID not found")
    void testFindByAppointmentIdNotFound() {
        Optional<MedicalRecord> found = medicalRecordRepository.findByAppointmentId(99999L);
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should correctly handle pagination for patient records")
    void testPaginationForPatientRecords() {
        // Request first page with size 1
        Pageable firstPage = PageRequest.of(0, 1);
        Page<MedicalRecord> page1 = medicalRecordRepository.findByPatientId(100L, firstPage);

        assertThat(page1.getContent()).hasSize(1);
        assertThat(page1.getTotalElements()).isEqualTo(2);
        assertThat(page1.getTotalPages()).isEqualTo(2);
        assertThat(page1.hasNext()).isTrue();

        // Request second page
        Pageable secondPage = PageRequest.of(1, 1);
        Page<MedicalRecord> page2 = medicalRecordRepository.findByPatientId(100L, secondPage);

        assertThat(page2.getContent()).hasSize(1);
        assertThat(page2.hasNext()).isFalse();
    }

    @Test
    @DisplayName("Should update medical record successfully")
    void testUpdateMedicalRecord() {
        MedicalRecord record = medicalRecordRepository.findById(testRecord1.getId()).orElseThrow();

        record.setDiagnosis("Updated Diagnosis");
        record.setTreatmentPlan("Updated Treatment Plan");

        MedicalRecord updated = medicalRecordRepository.save(record);

        assertThat(updated.getDiagnosis()).isEqualTo("Updated Diagnosis");
        assertThat(updated.getTreatmentPlan()).isEqualTo("Updated Treatment Plan");
        assertThat(updated.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should delete medical record successfully")
    void testDeleteMedicalRecord() {
        Long recordId = testRecord1.getId();
        medicalRecordRepository.deleteById(recordId);

        Optional<MedicalRecord> deleted = medicalRecordRepository.findById(recordId);
        assertThat(deleted).isEmpty();
    }

    @Test
    @DisplayName("Should count unique doctors correctly")
    void testCountUniqueDoctors() {
        long count = medicalRecordRepository.countUniqueDoctors();
        assertThat(count).isEqualTo(2); // doctorId 200 and 201
    }

    @Test
    @DisplayName("Should count unique patients correctly")
    void testCountUniquePatients() {
        long count = medicalRecordRepository.countUniquePatients();
        assertThat(count).isEqualTo(2); // patientId 100 and 101
    }

    @Test
    @DisplayName("Should validate hasFollowUp method")
    void testHasFollowUp() {
        assertThat(testRecord1.hasFollowUp()).isTrue();
        assertThat(testRecord2.hasFollowUp()).isFalse();
    }

    @Test
    @DisplayName("Should validate isFollowUpOverdue method")
    void testIsFollowUpOverdue() {
        MedicalRecord overdueRecord = MedicalRecord.builder()
                .patientId(103L)
                .doctorId(203L)
                .patientName("Test Patient")
                .doctorName("Test Doctor")
                .diagnosis("Test")
                .followUpDate(LocalDate.now().minusDays(1))
                .build();

        medicalRecordRepository.save(overdueRecord);

        assertThat(overdueRecord.isFollowUpOverdue()).isTrue();
        assertThat(testRecord1.isFollowUpOverdue()).isFalse();
    }
}
