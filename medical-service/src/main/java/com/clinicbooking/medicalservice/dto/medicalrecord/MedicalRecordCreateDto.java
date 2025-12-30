package com.clinicbooking.medicalservice.dto.medicalrecord;

import com.clinicbooking.medicalservice.dto.prescription.PrescriptionCreateDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordCreateDto {

    private Long appointmentId;

    @NotNull(message = "Bệnh nhân không được để trống")
    private Long patientId;

    @NotNull(message = "Bác sĩ không được để trống")
    private Long doctorId;

    @NotBlank(message = "Chẩn đoán không được để trống")
    private String diagnosis;

    private String symptoms;

    private String treatmentPlan;

    private String notes;

    private LocalDate followUpDate;

    private String attachments;

    @Valid
    @Builder.Default
    private List<PrescriptionCreateDto> prescriptions = new ArrayList<>();
}
