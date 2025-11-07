package com.clinicbooking.clinic_booking_system.mapper;

import com.clinicbooking.clinic_booking_system.dto.notification.NotificationCreateDto;
import com.clinicbooking.clinic_booking_system.dto.notification.NotificationResponseDto;
import com.clinicbooking.clinic_booking_system.dto.notification.NotificationUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.Notification;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class NotificationMapper {

    public Notification toEntity(NotificationCreateDto dto) {
        return Notification.builder()
                .type(dto.getType())
                .title(dto.getTitle())
                .message(dto.getMessage())
                .relatedId(dto.getRelatedId())
                .relatedType(dto.getRelatedType())
                .isRead(false)
                .build();
    }

    public void updateEntity(Notification notification, NotificationUpdateDto dto) {
        if (dto.getIsRead() != null) notification.setIsRead(dto.getIsRead());
    }

    public NotificationResponseDto toResponseDto(Notification notification) {
        return NotificationResponseDto.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .userFullName(notification.getUser().getFullName())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .relatedId(notification.getRelatedId())
                .relatedType(notification.getRelatedType())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    public List<NotificationResponseDto> toResponseDtoList(List<Notification> notifications) {
        return notifications.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }
}
