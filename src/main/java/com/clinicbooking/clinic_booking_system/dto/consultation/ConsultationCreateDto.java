package com.clinicbooking.clinic_booking_system.dto.consultation;

import com.clinicbooking.clinic_booking_system.entity.Consultation;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationCreateDto {
    @NotNull(message = "Patient ID không được để trống")
    private Long patientId;

    @NotNull(message = "Doctor ID không được để trống")
    private Long doctorId;

    private Long familyMemberId;

    @NotNull(message = "Loại tư vấn không được để trống")
    private Consultation.ConsultationType type;

    private String notes;
}
