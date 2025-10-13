package com.clinicbooking.userservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "family_members", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User không được để trống")
    private User user;

    @Column(name = "full_name", nullable = false)
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @Column(name = "date_of_birth", nullable = false)
    @NotNull(message = "Ngày sinh không được để trống")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private User.Gender gender;

    @Column(length = 50)
    private String relationship;

    @Column(name = "blood_type", length = 10)
    private String bloodType;

    @Column(precision = 5, scale = 2)
    private BigDecimal height;

    @Column(precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "chronic_diseases", columnDefinition = "TEXT")
    private String chronicDiseases;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Removed @OneToMany relationships to other microservices
    // (Appointment, MedicalRecord, HealthMetric, AIAnalysis)

    // Helper methods
    public Integer getAge() {
        if (dateOfBirth == null) {
            return null;
        }
        return LocalDate.now().getYear() - dateOfBirth.getYear();
    }

    public BigDecimal getBMI() {
        if (height == null || weight == null) {
            return null;
        }
        BigDecimal heightInMeters = height.divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal denominator = heightInMeters.multiply(heightInMeters);
        if (denominator.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return weight.divide(denominator, 2, RoundingMode.HALF_UP);
    }
}
