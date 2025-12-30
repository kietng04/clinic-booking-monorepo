package com.clinicbooking.medicalservice.repository;

import com.clinicbooking.medicalservice.entity.HealthMetric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HealthMetricRepository extends JpaRepository<HealthMetric, Long> {
    Page<HealthMetric> findByPatientId(Long patientId, Pageable pageable);
    List<HealthMetric> findByPatientIdAndMetricType(Long patientId, String metricType);
    List<HealthMetric> findByPatientIdAndMeasuredAtBetween(Long patientId, LocalDateTime start, LocalDateTime end);
}
