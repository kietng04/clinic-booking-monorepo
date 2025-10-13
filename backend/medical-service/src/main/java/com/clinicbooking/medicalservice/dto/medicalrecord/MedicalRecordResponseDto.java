package com.clinicbooking.medicalservice.dto.medicalrecord;

import com.clinicbooking.medicalservice.dto.prescription.PrescriptionResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordResponseDto {

    private Long id;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String patientName;
    private String doctorName;
    private String diagnosis;
    private String symptoms;
    private String treatmentPlan;
    private String notes;
    private LocalDate followUpDate;
    private String attachments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<PrescriptionResponseDto> prescriptions = new ArrayList<>();
}
