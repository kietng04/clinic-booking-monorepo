package com.clinicbooking.appointmentservice.dto;

import com.clinicbooking.appointmentservice.entity.MedicalService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalServiceCreateDto {
    @NotNull(message = "ID phòng khám không được để trống")
    private Long clinicId;

    @NotBlank(message = "Tên dịch vụ không được để trống")
    private String name;

    private String description;
    private MedicalService.ServiceCategory category;
    private Integer durationMinutes;
}
