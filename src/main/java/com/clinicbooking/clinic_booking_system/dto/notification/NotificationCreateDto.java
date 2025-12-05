package com.clinicbooking.clinic_booking_system.dto.notification;

import com.clinicbooking.clinic_booking_system.entity.Notification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCreateDto {
    @NotNull(message = "User ID không được để trống")
    private Long userId;

    @NotNull(message = "Loại thông báo không được để trống")
    private Notification.NotificationType type;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String message;

    private Long relatedId;
    private String relatedType;
}
