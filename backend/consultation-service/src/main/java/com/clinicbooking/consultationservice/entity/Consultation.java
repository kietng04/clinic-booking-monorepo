package com.clinicbooking.consultationservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing an online consultation request
 */
@Entity
@Table(name = "consultations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID of the patient requesting consultation
     */
    @Column(nullable = false)
    private Long patientId;

    /**
     * Name of the patient (cached from user-service)
     */
    @Column(nullable = false)
    private String patientName;

    /**
     * ID of the doctor assigned to this consultation
     */
    @Column(nullable = false)
    private Long doctorId;

    /**
     * Name of the doctor (cached from user-service)
     */
    @Column(nullable = false)
    private String doctorName;

    /**
     * Specialization of the doctor
     */
    private String specialization;

    /**
     * Topic or reason for consultation
     */
    @Column(nullable = false, length = 500)
    private String topic;

    /**
     * Detailed symptoms or description from patient
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Current status of the consultation
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ConsultationStatus status = ConsultationStatus.PENDING;

    /**
     * Consultation fee in VND
     */
    @Column(nullable = false)
    private BigDecimal fee;

    /**
     * Whether payment has been completed
     */
    @Builder.Default
    private Boolean isPaid = false;

    /**
     * Payment transaction ID if paid
     */
    private String paymentId;

    /**
     * Timestamp when consultation was created
     */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when consultation was last updated
     */
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /**
     * Timestamp when doctor accepted the request
     */
    private LocalDateTime acceptedAt;

    /**
     * Timestamp when consultation started (first message)
     */
    private LocalDateTime startedAt;

    /**
     * Timestamp when consultation ended
     */
    private LocalDateTime completedAt;

    /**
     * Reason for rejection if status is REJECTED
     */
    @Column(length = 500)
    private String rejectionReason;

    /**
     * Doctor's notes or summary after consultation
     */
    @Column(columnDefinition = "TEXT")
    private String doctorNotes;

    /**
     * Diagnosis provided by doctor
     */
    @Column(length = 1000)
    private String diagnosis;

    /**
     * Prescription or treatment plan
     */
    @Column(columnDefinition = "TEXT")
    private String prescription;

    /**
     * Rating given by patient (1-5)
     */
    @Column(precision = 2, scale = 1)
    private BigDecimal rating;

    /**
     * Review comment from patient
     */
    @Column(length = 1000)
    private String review;
}
