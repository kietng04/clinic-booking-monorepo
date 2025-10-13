package com.clinicbooking.appointmentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClinicCreateDto {
    @NotBlank(message = "Tên phòng khám không được để trống")
    @Size(max = 255)
    private String name;

    private String address;
    private String phone;
    private String email;
    private String description;
    private String openingHours;
}
