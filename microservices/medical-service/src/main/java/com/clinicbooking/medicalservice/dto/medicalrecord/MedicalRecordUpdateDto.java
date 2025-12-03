package com.clinicbooking.medicalservice.dto.medicalrecord;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordUpdateDto {

    @NotBlank(message = "Chẩn đoán không được để trống")
    private String diagnosis;

    private String symptoms;

    private String treatmentPlan;

    private String notes;

    private LocalDate followUpDate;

    private String attachments;
}
