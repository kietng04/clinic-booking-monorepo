package com.clinicbooking.medicalservice.dto.medication;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationCreateDto {

    @NotBlank(message = "Tên thuốc không được để trống")
    private String name;

    private String genericName;

    private String category;

    private String unit;

    private String defaultDosage;

    private String defaultFrequency;

    private String defaultDuration;

    private String instructions;
}
