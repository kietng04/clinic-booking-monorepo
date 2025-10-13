package com.clinicbooking.appointmentservice.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentFeedbackDto {

    @NotNull(message = "Điểm đánh giá không được để trống")
    @DecimalMin(value = "1.0", message = "Điểm đánh giá phải từ 1 đến 5")
    @DecimalMax(value = "5.0", message = "Điểm đánh giá phải từ 1 đến 5")
    @Digits(integer = 1, fraction = 1, message = "Điểm đánh giá không hợp lệ")
    private BigDecimal rating;

    @Size(max = 1000, message = "Nội dung đánh giá tối đa 1000 ký tự")
    private String review;
}
