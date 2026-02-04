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
public class StatusDistributionDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String name;
    private Integer value;
    private String color;
}
