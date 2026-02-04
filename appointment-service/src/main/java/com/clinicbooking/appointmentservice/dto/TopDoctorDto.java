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
public class TopDoctorDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String specialization;
    private Integer appointments;
    private BigDecimal revenue;
    private Double rating;
    private Integer completionRate;
}
