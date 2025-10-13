package com.clinicbooking.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentUpdateDto {

    private LocalDate appointmentDate;

    private LocalTime appointmentTime;

    private Integer durationMinutes;

    private String type; // IN_PERSON, ONLINE

    private String symptoms;

    private String notes;

    private String priority; // NORMAL, URGENT
}
