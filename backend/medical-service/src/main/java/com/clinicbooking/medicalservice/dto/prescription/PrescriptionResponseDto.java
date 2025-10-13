package com.clinicbooking.medicalservice.dto.prescription;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponseDto {

    private Long id;
    private Long medicalRecordId;
    private Long doctorId;
    private String doctorName;
    private Long medicationId;
    private String medicationName;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
    private String notes;
    private LocalDateTime createdAt;
}
