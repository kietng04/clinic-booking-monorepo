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
public class AppointmentPaymentLinkDto {
    private String paymentOrderId;
    private String paymentMethod;
    private LocalDateTime paymentExpiresAt;
}
