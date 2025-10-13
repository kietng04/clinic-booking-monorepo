package com.clinicbooking.userservice.dto.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserGrowthDto {
    private String month;
    private Integer patients;
    private Integer doctors;
    private Integer total;
}
