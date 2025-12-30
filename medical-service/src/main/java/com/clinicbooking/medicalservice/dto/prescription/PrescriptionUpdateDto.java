package com.clinicbooking.medicalservice.dto.prescription;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionUpdateDto {

    private String medicationName;

    private String dosage;

    private String frequency;

    private String duration;

    private String instructions;

    private String notes;
}
