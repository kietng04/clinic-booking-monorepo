package com.clinicbooking.clinic_booking_system.dto.prescription;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionCreateDto {
    @NotNull
    private Long medicalRecordId;
    @NotNull
    private Long doctorId;
    private String notes;
    private List<MedicationDto> medications;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicationDto {
        @NotNull
        private String medicationName;
        @NotNull
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }
}
