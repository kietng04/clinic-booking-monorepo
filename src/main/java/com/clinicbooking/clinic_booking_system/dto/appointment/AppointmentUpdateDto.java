package com.clinicbooking.clinic_booking_system.dto.appointment;

import com.clinicbooking.clinic_booking_system.entity.Appointment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentUpdateDto {
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private Integer durationMinutes;
    private Appointment.AppointmentStatus status;
    private String symptoms;
    private String notes;
    private String cancelReason;
}
