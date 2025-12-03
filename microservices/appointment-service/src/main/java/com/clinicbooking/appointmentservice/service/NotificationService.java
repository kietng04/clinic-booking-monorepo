package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.NotificationCreateDto;
import com.clinicbooking.appointmentservice.dto.NotificationResponseDto;
import com.clinicbooking.appointmentservice.dto.NotificationUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    NotificationResponseDto createNotification(NotificationCreateDto dto);

    NotificationResponseDto getNotificationById(Long id);

    Page<NotificationResponseDto> getNotificationsByUserId(Long userId, Pageable pageable);

    List<NotificationResponseDto> getUnreadNotificationsByUserId(Long userId);

    Page<NotificationResponseDto> getNotificationsByUserIdAndReadStatus(Long userId, Boolean isRead, Pageable pageable);

    long countUnreadByUserId(Long userId);

    NotificationResponseDto updateNotification(Long id, NotificationUpdateDto dto);

    NotificationResponseDto markAsRead(Long id);

    void markAllAsReadByUserId(Long userId);

    void deleteNotification(Long id);
}
