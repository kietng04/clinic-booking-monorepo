package com.clinicbooking.consultationservice.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for completing a consultation with doctor notes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteConsultationRequestDto {

    /**
     * Doctor's notes or summary
     */
    @Size(max = 2000, message = "Doctor notes must not exceed 2000 characters")
    private String doctorNotes;

    /**
     * Diagnosis
     */
    @Size(max = 1000, message = "Diagnosis must not exceed 1000 characters")
    private String diagnosis;

    /**
     * Prescription or treatment plan
     */
    @Size(max = 2000, message = "Prescription must not exceed 2000 characters")
    private String prescription;
}
