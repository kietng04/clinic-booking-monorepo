package com.clinicbooking.clinic_booking_system.repository;

import com.clinicbooking.clinic_booking_system.entity.AIAnalysis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AIAnalysisRepository extends JpaRepository<AIAnalysis, Long> {
    Page<AIAnalysis> findByFamilyMemberId(Long familyMemberId, Pageable pageable);
    Page<AIAnalysis> findByFamilyMemberIdAndAnalysisType(Long familyMemberId, String analysisType, Pageable pageable);
    Page<AIAnalysis> findBySeverity(AIAnalysis.Severity severity, Pageable pageable);
}
