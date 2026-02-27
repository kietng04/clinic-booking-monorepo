package com.clinicbooking.appointmentservice.dto;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentTrendDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String month;
    private Integer total;
    private Integer completed;
    private Integer cancelled;
}
