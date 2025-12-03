package com.clinicbooking.appointmentservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorScheduleUpdateDto {

    @Min(value = 0, message = "Ngày trong tuần phải từ 0-6")
    @Max(value = 6, message = "Ngày trong tuần phải từ 0-6")
    private Integer dayOfWeek;

    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isAvailable;
}
