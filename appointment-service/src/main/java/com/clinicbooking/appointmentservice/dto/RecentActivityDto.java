package com.clinicbooking.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDto {
    private Long id;
    private ActivityType type;
    private String message;
    private LocalDateTime timestamp;

    public enum ActivityType {
        APPOINTMENT,
        DOCTOR_APPROVAL,
        SYSTEM
    }
}
