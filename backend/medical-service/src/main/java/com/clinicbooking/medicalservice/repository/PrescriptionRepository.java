package com.clinicbooking.medicalservice.repository;

import com.clinicbooking.medicalservice.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByMedicalRecordId(Long medicalRecordId);
    Page<Prescription> findByMedicalRecordId(Long medicalRecordId, Pageable pageable);
    List<Prescription> findByDoctorId(Long doctorId);

    // Statistics queries
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Prescription p WHERE YEAR(p.createdAt) = YEAR(CURRENT_DATE()) AND MONTH(p.createdAt) = MONTH(CURRENT_DATE())")
    long countPrescriptionsThisMonth();
}
