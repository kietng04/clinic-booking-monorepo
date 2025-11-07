package com.clinicbooking.clinic_booking_system.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleResponseDto {
    private Long id;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private Integer dayOfWeek;
    private String dayOfWeekVietnamese;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isAvailable;
    private Integer durationMinutes;
    private LocalDateTime createdAt;
}
