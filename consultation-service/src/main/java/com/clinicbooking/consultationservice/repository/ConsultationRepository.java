package com.clinicbooking.consultationservice.repository;

import com.clinicbooking.consultationservice.entity.Consultation;
import com.clinicbooking.consultationservice.entity.ConsultationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Consultation entity
 */
@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    /**
     * Find consultations by patient ID with pagination
     */
    Page<Consultation> findByPatientIdOrderByCreatedAtDesc(Long patientId, Pageable pageable);

    /**
     * Find consultations by doctor ID with pagination
     */
    Page<Consultation> findByDoctorIdOrderByCreatedAtDesc(Long doctorId, Pageable pageable);

    /**
     * Find consultations by patient ID and status
     */
    List<Consultation> findByPatientIdAndStatus(Long patientId, ConsultationStatus status);

    /**
     * Find consultations by doctor ID and status
     */
    List<Consultation> findByDoctorIdAndStatus(Long doctorId, ConsultationStatus status);

    /**
     * Find pending consultations for a doctor
     */
    @Query("SELECT c FROM Consultation c WHERE c.doctorId = :doctorId " +
           "AND c.status = 'PENDING' ORDER BY c.createdAt ASC")
    List<Consultation> findPendingConsultationsByDoctor(@Param("doctorId") Long doctorId);

    /**
     * Find active consultations (ACCEPTED or IN_PROGRESS) for a doctor
     */
    @Query("SELECT c FROM Consultation c WHERE c.doctorId = :doctorId " +
           "AND (c.status = 'ACCEPTED' OR c.status = 'IN_PROGRESS') " +
           "ORDER BY c.acceptedAt ASC")
    List<Consultation> findActiveConsultationsByDoctor(@Param("doctorId") Long doctorId);

    /**
     * Find active consultations for a patient
     */
    @Query("SELECT c FROM Consultation c WHERE c.patientId = :patientId " +
           "AND (c.status = 'ACCEPTED' OR c.status = 'IN_PROGRESS') " +
           "ORDER BY c.acceptedAt ASC")
    List<Consultation> findActiveConsultationsByPatient(@Param("patientId") Long patientId);

    /**
     * Count consultations by doctor and status
     */
    Long countByDoctorIdAndStatus(Long doctorId, ConsultationStatus status);

    /**
     * Count consultations by patient
     */
    Long countByPatientId(Long patientId);

    /**
     * Find consultations created within a date range
     */
    @Query("SELECT c FROM Consultation c WHERE c.createdAt >= :startDate " +
           "AND c.createdAt <= :endDate ORDER BY c.createdAt DESC")
    List<Consultation> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);

    /**
     * Find consultations by doctor with status and date range
     */
    @Query("SELECT c FROM Consultation c WHERE c.doctorId = :doctorId " +
           "AND c.status = :status AND c.createdAt >= :startDate " +
           "ORDER BY c.createdAt DESC")
    List<Consultation> findByDoctorAndStatusAndDateAfter(
            @Param("doctorId") Long doctorId,
            @Param("status") ConsultationStatus status,
            @Param("startDate") LocalDateTime startDate
    );

    /**
     * Search consultations by topic or description
     */
    @Query("SELECT c FROM Consultation c WHERE " +
           "(LOWER(c.topic) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (c.patientId = :userId OR c.doctorId = :userId) " +
           "ORDER BY c.createdAt DESC")
    List<Consultation> searchConsultations(@Param("keyword") String keyword,
                                          @Param("userId") Long userId);
}
