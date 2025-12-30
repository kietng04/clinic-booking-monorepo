package com.clinicbooking.appointmentservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorScheduleCreateDto {

    @NotNull(message = "ID bác sĩ không được để trống")
    private Long doctorId;

    @NotNull(message = "Ngày trong tuần không được để trống")
    @Min(value = 0, message = "Ngày trong tuần phải từ 0-6")
    @Max(value = 6, message = "Ngày trong tuần phải từ 0-6")
    private Integer dayOfWeek;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    private LocalTime startTime;

    @NotNull(message = "Giờ kết thúc không được để trống")
    private LocalTime endTime;

    private Boolean isAvailable;
}
