package com.clinicbooking.userservice.dto.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecializationDistributionDto {
    private String specialization;
    private Integer count;
    private Integer percentage;
}
