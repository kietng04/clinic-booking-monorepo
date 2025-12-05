package com.clinicbooking.clinic_booking_system.dto.consultation;

import com.clinicbooking.clinic_booking_system.entity.Consultation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationUpdateDto {
    private Consultation.ConsultationStatus status;
    private String recordingUrl;
    private String summary;
    private String notes;
}
