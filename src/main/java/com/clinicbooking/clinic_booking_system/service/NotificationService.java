package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.notification.NotificationCreateDto;
import com.clinicbooking.clinic_booking_system.dto.notification.NotificationResponseDto;
import com.clinicbooking.clinic_booking_system.dto.notification.NotificationUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.Notification;
import com.clinicbooking.clinic_booking_system.entity.User;
import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import com.clinicbooking.clinic_booking_system.mapper.NotificationMapper;
import com.clinicbooking.clinic_booking_system.repository.NotificationRepository;
import com.clinicbooking.clinic_booking_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper mapper;

    public NotificationResponseDto create(NotificationCreateDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getUserId()));

        Notification notification = mapper.toEntity(dto);
        notification.setUser(user);
        Notification saved = notificationRepository.save(notification);
        return mapper.toResponseDto(saved);
    }

    public NotificationResponseDto getById(Long id) {
        Notification notification = findByIdOrThrow(id);
        return mapper.toResponseDto(notification);
    }

    public PageResponse<NotificationResponseDto> getAllByUser(Long userId, int page, int size) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notificationPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return buildPageResponse(notificationPage);
    }

    public PageResponse<NotificationResponseDto> getUnreadByUser(Long userId, int page, int size) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notificationPage = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable);
        return buildPageResponse(notificationPage);
    }

    public long getUnreadCount(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public NotificationResponseDto markAsRead(Long id) {
        Notification notification = findByIdOrThrow(id);
        notification.setIsRead(true);
        Notification updated = notificationRepository.save(notification);
        return mapper.toResponseDto(updated);
    }

    public void markAllAsReadForUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
        Page<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable);
        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications.getContent());
    }

    public PageResponse<NotificationResponseDto> search(
            Long userId, Notification.NotificationType type, Boolean isRead, int page, int size) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notificationPage = notificationRepository.searchNotifications(userId, type, isRead, pageable);
        return buildPageResponse(notificationPage);
    }

    private Notification findByIdOrThrow(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
    }

    private PageResponse<NotificationResponseDto> buildPageResponse(Page<Notification> page) {
        List<NotificationResponseDto> content = mapper.toResponseDtoList(page.getContent());
        return PageResponse.<NotificationResponseDto>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isLast(page.isLast())
                .isFirst(page.isFirst())
                .build();
    }
}
