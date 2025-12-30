package com.clinicbooking.appointmentservice.dto;

import com.clinicbooking.appointmentservice.entity.Notification;
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
public class NotificationCreateDto {

    @NotNull(message = "User ID không được để trống")
    private Long userId;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String message;

    private Notification.NotificationType type;
    private Long relatedId;
    private String relatedType;
}
