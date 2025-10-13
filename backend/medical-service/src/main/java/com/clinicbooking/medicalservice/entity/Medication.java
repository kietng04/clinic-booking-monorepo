package com.clinicbooking.medicalservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "medications", indexes = {
        @Index(name = "idx_medication_name", columnList = "name"),
        @Index(name = "idx_medication_category", columnList = "category"),
        @Index(name = "idx_medication_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "Tên thuốc không được để trống")
    private String name;

    @Column(name = "generic_name")
    private String genericName;

    @Column(length = 100)
    private String category;

    @Column(length = 50)
    @Builder.Default
    private String unit = "viên";

    @Column(name = "default_dosage", length = 100)
    private String defaultDosage;

    @Column(name = "default_frequency", length = 100)
    private String defaultFrequency;

    @Column(name = "default_duration", length = 100)
    private String defaultDuration;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
