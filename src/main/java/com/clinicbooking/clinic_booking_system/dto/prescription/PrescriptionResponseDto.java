package com.clinicbooking.clinic_booking_system.dto.prescription;

import com.clinicbooking.clinic_booking_system.dto.medication.MedicationResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponseDto {
    private Long id;
    private Long medicalRecordId;
    private Long doctorId;
    private String doctorName;
    private String notes;
    private String instructions;
    private List<MedicationResponseDto> medications;
    private LocalDateTime createdAt;
}
