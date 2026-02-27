package com.clinicbooking.medicalservice.dto.healthmetric;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthMetricCreateDto {

    @NotNull(message = "Bệnh nhân không được để trống")
    private Long patientId;

    private String patientName;

    @NotBlank(message = "Loại chỉ số không được để trống")
    private String metricType;

    @NotBlank(message = "Giá trị không được để trống")
    private String value;

    private String unit;

    @NotNull(message = "Thời gian đo không được để trống")
    private LocalDateTime measuredAt;

    private String notes;
}
