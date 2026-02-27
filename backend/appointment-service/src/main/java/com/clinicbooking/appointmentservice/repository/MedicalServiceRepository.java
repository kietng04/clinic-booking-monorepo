package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.MedicalService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalServiceRepository extends JpaRepository<MedicalService, Long> {
    List<MedicalService> findByClinicId(Long clinicId);

    List<MedicalService> findByClinicIdAndIsActiveTrue(Long clinicId);

    Page<MedicalService> findByCategoryAndIsActiveTrue(MedicalService.ServiceCategory category, Pageable pageable);

    Page<MedicalService> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<MedicalService> findByNameContainingIgnoreCaseAndCategory(String name, MedicalService.ServiceCategory category,
            Pageable pageable);
}
