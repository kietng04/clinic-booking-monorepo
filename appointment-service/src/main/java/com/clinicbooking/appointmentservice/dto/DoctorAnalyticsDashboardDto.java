package com.clinicbooking.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAnalyticsDashboardDto {
    private List<MonthlyAppointmentDto> appointments;
    private List<AppointmentTypeBreakdownDto> appointmentTypes;
    private List<TimeSlotStatsDto> timeSlots;
    private PatientDemographicsDto patientDemographics;
    private LocalDateTime generatedAt;
}
