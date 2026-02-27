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
public class SpecializationDistributionDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String specialization;
    private Integer count;
    private Integer percentage;
}
