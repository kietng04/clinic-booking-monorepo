package com.clinicbooking.clinic_booking_system.repository;

import com.clinicbooking.clinic_booking_system.entity.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    Page<Consultation> findByPatientId(Long patientId, Pageable pageable);
    Page<Consultation> findByDoctorId(Long doctorId, Pageable pageable);
    Page<Consultation> findByStatus(Consultation.ConsultationStatus status, Pageable pageable);
    List<Consultation> findByDoctorIdAndStatus(Long doctorId, Consultation.ConsultationStatus status);
}
