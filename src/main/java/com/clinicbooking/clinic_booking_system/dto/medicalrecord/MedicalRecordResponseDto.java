package com.clinicbooking.clinic_booking_system.dto.medicalrecord;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordResponseDto {
    private Long id;
    private Long appointmentId;
    private Long familyMemberId;
    private String familyMemberName;
    private Long doctorId;
    private String doctorName;
    private String diagnosis;
    private String symptoms;
    private String treatmentPlan;
    private LocalDate followUpDate;
    private String attachments;
    private LocalDateTime createdAt;
}
