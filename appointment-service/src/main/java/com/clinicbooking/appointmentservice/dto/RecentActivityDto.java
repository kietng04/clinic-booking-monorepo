package com.clinicbooking.appointmentservice.dto;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDto implements Serializable {
    private static final long serialVersionUID = 1L;

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
