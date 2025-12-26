package com.clinicbooking.appointmentservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEvent {
    private Long userId;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private LocalDateTime timestamp;
    private String eventType; // CREATED, UPDATED, DELETED
}
