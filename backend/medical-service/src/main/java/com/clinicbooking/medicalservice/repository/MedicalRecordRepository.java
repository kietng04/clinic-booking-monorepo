package com.clinicbooking.medicalservice.repository;

import com.clinicbooking.medicalservice.entity.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    Page<MedicalRecord> findByPatientId(Long patientId, Pageable pageable);
    Page<MedicalRecord> findByDoctorId(Long doctorId, Pageable pageable);
    Optional<MedicalRecord> findByAppointmentId(Long appointmentId);

    // Statistics queries
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT m.doctorId) FROM MedicalRecord m")
    long countUniqueDoctors();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT m.patientId) FROM MedicalRecord m")
    long countUniquePatients();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(m) FROM MedicalRecord m WHERE YEAR(m.createdAt) = YEAR(CURRENT_DATE()) AND MONTH(m.createdAt) = MONTH(CURRENT_DATE())")
    long countRecordsThisMonth();
}
