package com.clinicbooking.medicalservice.dto.prescription;

import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "Tên thuốc không được để trống")
    private String medicationName;

    private String dosage;

    private String frequency;

    private String duration;

    private String instructions;

    private String notes;
}
