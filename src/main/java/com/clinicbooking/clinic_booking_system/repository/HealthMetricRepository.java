package com.clinicbooking.clinic_booking_system.repository;

import com.clinicbooking.clinic_booking_system.entity.HealthMetric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface HealthMetricRepository extends JpaRepository<HealthMetric, Long> {
    Page<HealthMetric> findByFamilyMemberId(Long familyMemberId, Pageable pageable);
    Page<HealthMetric> findByFamilyMemberIdAndMetricType(Long familyMemberId, String metricType, Pageable pageable);
    Page<HealthMetric> findByFamilyMemberIdAndMeasuredAtBetween(Long familyMemberId, LocalDateTime start, LocalDateTime end, Pageable pageable);
}
