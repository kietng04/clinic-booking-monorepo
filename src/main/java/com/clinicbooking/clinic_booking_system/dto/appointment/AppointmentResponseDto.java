package com.clinicbooking.clinic_booking_system.dto.appointment;

import com.clinicbooking.clinic_booking_system.entity.Appointment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private Long familyMemberId;
    private String familyMemberName;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private Integer durationMinutes;
    private Appointment.AppointmentType type;
    private Appointment.AppointmentStatus status;
    private String symptoms;
    private String notes;
    private String cancelReason;
    private Appointment.Priority priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
