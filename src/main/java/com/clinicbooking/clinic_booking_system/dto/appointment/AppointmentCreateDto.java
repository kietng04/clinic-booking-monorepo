package com.clinicbooking.clinic_booking_system.dto.appointment;

import com.clinicbooking.clinic_booking_system.entity.Appointment;
import jakarta.validation.constraints.NotNull;
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
public class AppointmentCreateDto {
    @NotNull(message = "Bệnh nhân ID không được để trống")
    private Long patientId;

    @NotNull(message = "Bác sĩ ID không được để trống")
    private Long doctorId;

    private Long familyMemberId;

    @NotNull(message = "Ngày khám không được để trống")
    private LocalDate appointmentDate;

    @NotNull(message = "Giờ khám không được để trống")
    private LocalTime appointmentTime;

    @Builder.Default
    private Integer durationMinutes = 30;

    private Appointment.AppointmentType type;
    private String symptoms;
    private String notes;

    @Builder.Default
    private Appointment.Priority priority = Appointment.Priority.NORMAL;
}
