package com.clinicbooking.medicalservice.repository;

import com.clinicbooking.medicalservice.entity.HealthMetric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HealthMetricRepository extends JpaRepository<HealthMetric, Long> {

    /**
     * Find all health metrics by patient ID with pagination
     */
    Page<HealthMetric> findByPatientId(Long patientId, Pageable pageable);

    /**
     * Find all health metrics by patient ID and metric type
     */
    List<HealthMetric> findByPatientIdAndMetricType(Long patientId, String metricType);

    /**
     * Find all health metrics by patient ID within a date range
     */
    List<HealthMetric> findByPatientIdAndMeasuredAtBetween(Long patientId, LocalDateTime start, LocalDateTime end);

    /**
     * Find the latest health metric for a specific patient and metric type
     */
    @Query(
            value = """
                    SELECT *
                    FROM health_metrics
                    WHERE patient_id = :patientId
                      AND metric_type = :metricType
                    ORDER BY measured_at DESC
                    LIMIT 1
                    """,
            nativeQuery = true
    )
    Optional<HealthMetric> findLatestByPatientIdAndMetricType(
            @Param("patientId") Long patientId,
            @Param("metricType") String metricType);

    /**
     * Find abnormal metrics for a patient
     */
    List<HealthMetric> findByPatientIdOrderByMeasuredAtDesc(Long patientId);

    /**
     * Count metrics by patient ID and metric type
     */
    long countByPatientIdAndMetricType(Long patientId, String metricType);

    long countByPatientId(Long patientId);

    /**
     * Find metrics by patient ID, metric type, and date range
     */
    List<HealthMetric> findByPatientIdAndMetricTypeAndMeasuredAtBetween(
            Long patientId, String metricType, LocalDateTime start, LocalDateTime end);

    /**
     * Count metrics created in the current month
     */
    @Query("SELECT COUNT(h) FROM HealthMetric h WHERE YEAR(h.createdAt) = YEAR(CURRENT_DATE) AND MONTH(h.createdAt) = MONTH(CURRENT_DATE)")
    long countMetricsThisMonth();
}
