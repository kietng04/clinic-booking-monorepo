package com.clinicbooking.medicalservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions", indexes = {
        @Index(name = "idx_medical_record", columnList = "medical_record_id"),
        @Index(name = "idx_doctor", columnList = "doctor_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id", nullable = false)
    @NotNull(message = "Hồ sơ y tế không được để trống")
    private MedicalRecord medicalRecord;

    // Reference to User Service (doctor)
    @Column(name = "doctor_id", nullable = false)
    @NotNull(message = "Bác sĩ không được để trống")
    private Long doctorId;

    // Denormalized data
    @Column(name = "doctor_name")
    private String doctorName;

    @Column(name = "medication_name", nullable = false)
    @NotNull(message = "Tên thuốc không được để trống")
    private String medicationName;

    @Column(name = "dosage")
    private String dosage;

    @Column(name = "frequency")
    private String frequency;

    @Column(name = "duration")
    private String duration;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
