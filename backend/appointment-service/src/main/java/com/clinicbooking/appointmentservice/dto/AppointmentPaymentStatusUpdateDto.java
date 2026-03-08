package com.clinicbooking.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentPaymentStatusUpdateDto {
    private String paymentStatus;
    private String paymentMethod;
    private LocalDateTime paymentExpiresAt;
    private LocalDateTime paymentCompletedAt;
}
