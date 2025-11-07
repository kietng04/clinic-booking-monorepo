package com.clinicbooking.clinic_booking_system.dto.consultation;

import com.clinicbooking.clinic_booking_system.entity.Consultation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationResponseDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long familyMemberId;
    private String familyMemberName;
    private Consultation.ConsultationType type;
    private Consultation.ConsultationStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String recordingUrl;
    private String summary;
    private String notes;
    private LocalDateTime createdAt;
}
