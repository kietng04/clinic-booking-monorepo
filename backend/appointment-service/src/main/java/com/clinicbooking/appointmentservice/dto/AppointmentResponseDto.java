package com.clinicbooking.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponseDto {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private String patientName;
    private String doctorName;
    private String patientPhone;
    private Long familyMemberId;
    private String familyMemberName;
    private Long clinicId;
    private Long roomId;
    private Long serviceId;
    private BigDecimal serviceFee;
    private BigDecimal patientRating;
    private String patientReview;
    private LocalDateTime reviewedAt;
    private String paymentStatus;
    private String paymentOrderId;
    private String paymentMethod;
    private LocalDateTime paymentExpiresAt;
    private LocalDateTime paidAt;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private Integer durationMinutes;
    private String type;
    private String status;
    private String symptoms;
    private String notes;
    private String cancelReason;
    private String priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
