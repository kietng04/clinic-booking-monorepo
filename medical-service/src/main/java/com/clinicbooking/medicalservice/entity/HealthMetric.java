package com.clinicbooking.medicalservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "health_metrics", indexes = {
        @Index(name = "idx_patient_metric", columnList = "patient_id, metric_type, measured_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reference to User Service (patient/family member)
    @Column(name = "patient_id", nullable = false)
    @NotNull(message = "Bệnh nhân không được để trống")
    private Long patientId;

    // Denormalized data
    @Column(name = "patient_name")
    private String patientName;

    @Column(name = "metric_type", length = 50, nullable = false)
    @NotBlank(message = "Loại chỉ số không được để trống")
    private String metricType;

    @Column(length = 100, nullable = false)
    @NotBlank(message = "Giá trị không được để trống")
    private String value;

    @Column(length = 20)
    private String unit;

    @Column(name = "measured_at", nullable = false)
    @NotNull(message = "Thời gian đo không được để trống")
    private LocalDateTime measuredAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public boolean isBloodPressure() {
        return "blood_pressure".equals(metricType);
    }

    public boolean isBloodSugar() {
        return "blood_sugar".equals(metricType);
    }

    public boolean isWeight() {
        return "weight".equals(metricType);
    }

    public boolean isTemperature() {
        return "temperature".equals(metricType);
    }

    public boolean isHeartRate() {
        return "heart_rate".equals(metricType);
    }

    public Integer getSystolic() {
        if (!isBloodPressure()) {
            return null;
        }
        String[] parts = value.split("/");
        return parts.length >= 1 ? Integer.parseInt(parts[0]) : null;
    }

    public Integer getDiastolic() {
        if (!isBloodPressure()) {
            return null;
        }
        String[] parts = value.split("/");
        return parts.length >= 2 ? Integer.parseInt(parts[1]) : null;
    }

    public boolean isAbnormal() {
        try {
            return switch (metricType) {
                case "blood_pressure" -> {
                    Integer sys = getSystolic();
                    Integer dia = getDiastolic();
                    yield sys != null && dia != null && (sys > 140 || sys < 90 || dia > 90 || dia < 60);
                }
                case "blood_sugar" -> {
                    double val = Double.parseDouble(value);
                    yield val > 200 || val < 70;
                }
                case "heart_rate" -> {
                    int val = Integer.parseInt(value);
                    yield val > 100 || val < 60;
                }
                case "temperature" -> {
                    double val = Double.parseDouble(value);
                    yield val > 38.0 || val < 36.0;
                }
                default -> false;
            };
        } catch (Exception e) {
            return false;
        }
    }
}
