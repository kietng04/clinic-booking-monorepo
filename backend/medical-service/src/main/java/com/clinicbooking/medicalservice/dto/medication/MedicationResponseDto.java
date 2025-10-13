package com.clinicbooking.medicalservice.dto.medication;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationResponseDto {

    private Long id;

    private String name;

    private String genericName;

    private String category;

    private String unit;

    private String defaultDosage;

    private String defaultFrequency;

    private String defaultDuration;

    private String instructions;

    private Boolean isActive;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
