package com.clinicbooking.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyAppointmentDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String month;
    private Integer count;
    private BigDecimal revenue;
    private Integer completed;
}
