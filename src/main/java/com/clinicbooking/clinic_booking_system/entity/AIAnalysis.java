package com.clinicbooking.clinic_booking_system.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analyses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_member_id", nullable = false)
    @NotNull(message = "Thành viên gia đình không được để trống")
    private FamilyMember familyMember;

    @Column(name = "analysis_type", length = 50, nullable = false)
    private String analysisType;

    @Column(name = "input_data", columnDefinition = "jsonb")
    private String inputData;

    @Column(name = "result_data", columnDefinition = "jsonb")
    private String resultData;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Severity severity;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH
    }

    public boolean isHealthTrend() {
        return "health_trend".equals(analysisType);
    }

    public boolean isRiskPrediction() {
        return "risk_prediction".equals(analysisType);
    }

    public boolean isSymptomAnalysis() {
        return "symptom_analysis".equals(analysisType);
    }

    public boolean isMedicationInteraction() {
        return "medication_interaction".equals(analysisType);
    }

    public boolean isLifestyleRecommendation() {
        return "lifestyle_recommendation".equals(analysisType);
    }

    public boolean requiresAttention() {
        return severity == Severity.HIGH || severity == Severity.MEDIUM;
    }

    public boolean isUrgent() {
        return severity == Severity.HIGH;
    }
}
