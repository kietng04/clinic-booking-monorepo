package com.clinicbooking.appointmentservice.dto;

import jakarta.validation.constraints.NotNull;
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
public class AppointmentRescheduleDto {

    @NotNull(message = "Ngày khám mới không được để trống")
    private LocalDate newDate;

    @NotNull(message = "Giờ khám mới không được để trống")
    private LocalTime newTime;

    private String reason;
}
