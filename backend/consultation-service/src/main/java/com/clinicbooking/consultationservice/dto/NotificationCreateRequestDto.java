package com.clinicbooking.consultationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationCreateRequestDto {
    private Long userId;
    private String title;
    private String message;
    private String type;
    private Long relatedId;
    private String relatedType;
}
