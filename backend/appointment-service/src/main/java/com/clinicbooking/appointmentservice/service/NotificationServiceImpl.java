package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.client.UserServiceClient;
import com.clinicbooking.appointmentservice.dto.NotificationCreateDto;
import com.clinicbooking.appointmentservice.dto.NotificationResponseDto;
import com.clinicbooking.appointmentservice.dto.NotificationUpdateDto;
import com.clinicbooking.appointmentservice.dto.UserDto;
import com.clinicbooking.appointmentservice.entity.Notification;
import com.clinicbooking.appointmentservice.mapper.NotificationMapper;
import com.clinicbooking.appointmentservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserServiceClient userServiceClient;

    @Override
    @Transactional
    public NotificationResponseDto createNotification(NotificationCreateDto dto) {
        log.info("Creating notification for user ID: {}", dto.getUserId());

        // Fetch user info
        UserDto user = userServiceClient.getUserById(dto.getUserId());

        Notification notification = notificationMapper.toEntity(dto);
        notification.setUserName(user.getFullName());

        notification = notificationRepository.save(notification);
        log.info("Notification created with ID: {}", notification.getId());

        return notificationMapper.toDto(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponseDto getNotificationById(Long id) {
        log.info("Fetching notification with ID: {}", id);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
        return notificationMapper.toDto(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponseDto> getNotificationsByUserId(Long userId, Pageable pageable) {
        log.info("Fetching notifications for user ID: {}", userId);
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(notificationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getUnreadNotificationsByUserId(Long userId) {
        log.info("Fetching unread notifications for user ID: {}", userId);
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return notificationMapper.toDtoList(notifications);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponseDto> getNotificationsByUserIdAndReadStatus(Long userId, Boolean isRead, Pageable pageable) {
        log.info("Fetching notifications for user ID: {} with read status: {}", userId, isRead);
        Page<Notification> notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, isRead, pageable);
        return notifications.map(notificationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnreadByUserId(Long userId) {
        log.info("Counting unread notifications for user ID: {}", userId);
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public NotificationResponseDto updateNotification(Long id, NotificationUpdateDto dto) {
        log.info("Updating notification with ID: {}", id);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));

        if (dto.getIsRead() != null) {
            notification.setIsRead(dto.getIsRead());
        }

        notification = notificationRepository.save(notification);
        log.info("Notification updated successfully: {}", id);

        return notificationMapper.toDto(notification);
    }

    @Override
    @Transactional
    public NotificationResponseDto markAsRead(Long id) {
        log.info("Marking notification as read: {}", id);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));

        notification.markAsRead();
        notification = notificationRepository.save(notification);

        return notificationMapper.toDto(notification);
    }

    @Override
    @Transactional
    public Page<NotificationResponseDto> getNotificationsByUserIdAndType(Long userId, Notification.NotificationType type, Pageable pageable) {
        log.info("Fetching notifications for user ID: {} with type: {}", userId, type);
        Page<Notification> notifications = notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable);
        return notifications.map(notificationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getNotificationsByUserIdAndRelatedId(Long userId, Long relatedId) {
        log.info("Fetching notifications for user ID: {} with related ID: {}", userId, relatedId);
        List<Notification> notifications = notificationRepository.findByUserIdAndRelatedIdOrderByCreatedAtDesc(userId, relatedId);
        return notificationMapper.toDtoList(notifications);
    }

    @Override
    @Transactional
    public void markAllAsReadByUserId(Long userId) {
        log.info("Marking all notifications as read for user ID: {}", userId);

        int updatedCount = notificationRepository.markAllAsReadByUserId(userId);

        log.info("Marked {} notifications as read", updatedCount);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        log.info("Deleting notification with ID: {}", id);

        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy thông báo");
        }

        notificationRepository.deleteById(id);
        log.info("Notification deleted successfully: {}", id);
    }

    @Override
    @Transactional
    public void deleteAllNotificationsByUserId(Long userId) {
        log.info("Deleting all notifications for user ID: {}", userId);
        long deletedCount = notificationRepository.count();
        notificationRepository.deleteAll(notificationRepository.findAll().stream()
                .filter(n -> n.getUserId().equals(userId))
                .toList());
        log.info("Deleted notifications for user ID: {}", userId);
    }
}
