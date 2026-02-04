package com.clinicbooking.appointmentservice.dto;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRevenueDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String month;
    private BigDecimal thisYear;
    private BigDecimal lastYear;
}
