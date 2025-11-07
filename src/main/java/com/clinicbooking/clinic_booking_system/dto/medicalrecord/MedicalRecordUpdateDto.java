package com.clinicbooking.clinic_booking_system.dto.medicalrecord;

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
    private String diagnosis;
    private String symptoms;
    private String treatmentPlan;
    private LocalDate followUpDate;
    private String attachments;
}
