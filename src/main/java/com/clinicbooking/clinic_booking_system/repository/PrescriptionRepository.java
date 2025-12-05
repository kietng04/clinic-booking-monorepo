package com.clinicbooking.clinic_booking_system.repository;

import com.clinicbooking.clinic_booking_system.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Page<Prescription> findByMedicalRecordId(Long medicalRecordId, Pageable pageable);
    Page<Prescription> findByDoctorId(Long doctorId, Pageable pageable);
}
