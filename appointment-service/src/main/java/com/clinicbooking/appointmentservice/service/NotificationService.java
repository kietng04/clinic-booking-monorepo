package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.NotificationCreateDto;
import com.clinicbooking.appointmentservice.dto.NotificationResponseDto;
import com.clinicbooking.appointmentservice.dto.NotificationUpdateDto;
import com.clinicbooking.appointmentservice.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    /**
     * Create a new notification
     */
    NotificationResponseDto createNotification(NotificationCreateDto dto);

    /**
     * Get notification by ID
     */
    NotificationResponseDto getNotificationById(Long id);

    /**
     * Get all notifications for a user with pagination (sorted by createdAt DESC)
     */
    Page<NotificationResponseDto> getNotificationsByUserId(Long userId, Pageable pageable);

    /**
     * Get all unread notifications for a user (sorted by createdAt DESC)
     */
    List<NotificationResponseDto> getUnreadNotificationsByUserId(Long userId);

    /**
     * Get notifications by user and read status with pagination (sorted by createdAt DESC)
     */
    Page<NotificationResponseDto> getNotificationsByUserIdAndReadStatus(Long userId, Boolean isRead, Pageable pageable);

    /**
     * Count unread notifications for a user
     */
    long countUnreadByUserId(Long userId);

    /**
     * Get notifications by type with pagination (sorted by createdAt DESC)
     */
    Page<NotificationResponseDto> getNotificationsByUserIdAndType(Long userId, Notification.NotificationType type, Pageable pageable);

    /**
     * Get notifications by related ID
     */
    List<NotificationResponseDto> getNotificationsByUserIdAndRelatedId(Long userId, Long relatedId);

    /**
     * Update notification
     */
    NotificationResponseDto updateNotification(Long id, NotificationUpdateDto dto);

    /**
     * Mark notification as read
     */
    NotificationResponseDto markAsRead(Long id);

    /**
     * Mark all notifications as read for a user
     */
    void markAllAsReadByUserId(Long userId);

    /**
     * Delete notification
     */
    void deleteNotification(Long id);

    /**
     * Delete all notifications for a user
     */
    void deleteAllNotificationsByUserId(Long userId);
}
