package com.clinicbooking.clinic_booking_system.dto.appointment;

import com.clinicbooking.clinic_booking_system.entity.Appointment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentSearchCriteria {
    private Long patientId;
    private Long doctorId;
    private Appointment.AppointmentStatus status;
    private Appointment.AppointmentType type;
    private LocalDate startDate;
    private LocalDate endDate;
}
