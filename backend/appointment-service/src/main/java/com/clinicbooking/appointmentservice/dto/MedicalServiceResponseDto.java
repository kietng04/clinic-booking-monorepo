package com.clinicbooking.appointmentservice.dto;

import com.clinicbooking.appointmentservice.entity.MedicalService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalServiceResponseDto {
    private Long id;
    private Long clinicId;
    private String name;
    private String description;
    private MedicalService.ServiceCategory category;
    private Integer durationMinutes;
    private Boolean isActive;
    private BigDecimal currentPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
