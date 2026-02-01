package com.clinicbooking.appointmentservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicePriceCreateDto {
    @NotNull(message = "ID dịch vụ không được để trống")
    private Long serviceId;

    private Long doctorId;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0", message = "Giá không thể âm")
    private BigDecimal price;

    private String currency;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
