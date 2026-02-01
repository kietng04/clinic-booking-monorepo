package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.Clinic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClinicRepository extends JpaRepository<Clinic, Long> {
    List<Clinic> findByIsActiveTrue();
    Page<Clinic> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
