package com.clinicbooking.medicalservice.dto.medication;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationUpdateDto {

    private String name;

    private String genericName;

    private String category;

    private String unit;

    private String defaultDosage;

    private String defaultFrequency;

    private String defaultDuration;

    private String instructions;

    private Boolean isActive;
}
