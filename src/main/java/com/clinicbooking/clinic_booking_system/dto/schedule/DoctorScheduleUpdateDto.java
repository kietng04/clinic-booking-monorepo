package com.clinicbooking.clinic_booking_system.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleUpdateDto {
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isAvailable;
}
