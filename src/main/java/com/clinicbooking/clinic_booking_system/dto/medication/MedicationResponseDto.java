package com.clinicbooking.clinic_booking_system.dto.medication;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationResponseDto {
    private Long id;
    private Long prescriptionId;
    private String medicationName;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
}
