package com.clinicbooking.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentTypeBreakdownDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String name;
    private Integer value;
    private Integer count;
}
