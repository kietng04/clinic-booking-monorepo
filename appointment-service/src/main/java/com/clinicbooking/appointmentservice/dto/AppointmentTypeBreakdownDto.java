package com.clinicbooking.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentTypeBreakdownDto {
    private String name;
    private Integer value;
    private Integer count;
}
