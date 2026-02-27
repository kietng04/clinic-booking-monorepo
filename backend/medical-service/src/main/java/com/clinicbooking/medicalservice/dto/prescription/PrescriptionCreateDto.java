package com.clinicbooking.medicalservice.dto.prescription;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionCreateDto {

    @NotNull(message = "Bác sĩ không được để trống")
    private Long doctorId;

    // Optional - if provided, will auto-fill from medication catalog
    private Long medicationId;

    // Required if medicationId is not provided
    private String medicationName;

    private String dosage;

    private String frequency;

    private String duration;

    private String instructions;

    private String notes;
}
