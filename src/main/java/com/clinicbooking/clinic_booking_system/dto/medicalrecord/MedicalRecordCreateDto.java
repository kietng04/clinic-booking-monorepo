package com.clinicbooking.clinic_booking_system.dto.medicalrecord;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordCreateDto {
    @NotNull
    private Long appointmentId;
    @NotNull
    private Long familyMemberId;
    @NotNull
    private Long doctorId;
    @NotNull
    private String diagnosis;
    private String symptoms;
    private String treatmentPlan;
    private LocalDate followUpDate;
    private String attachments;
}
