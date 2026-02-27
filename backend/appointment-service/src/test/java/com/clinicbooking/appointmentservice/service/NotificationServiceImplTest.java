package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.client.UserServiceClient;
import com.clinicbooking.appointmentservice.dto.NotificationCreateDto;
import com.clinicbooking.appointmentservice.dto.NotificationResponseDto;
import com.clinicbooking.appointmentservice.dto.NotificationUpdateDto;
import com.clinicbooking.appointmentservice.dto.UserDto;
import com.clinicbooking.appointmentservice.entity.Notification;
import com.clinicbooking.appointmentservice.entity.Notification.NotificationType;
import com.clinicbooking.appointmentservice.mapper.NotificationMapper;
import com.clinicbooking.appointmentservice.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationServiceImpl Tests")
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationMapper notificationMapper;

    @Mock
    private UserServiceClient userServiceClient;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private NotificationCreateDto createDto;
    private Notification notification;
    private NotificationResponseDto responseDto;
    private UserDto userDto;

    @BeforeEach
    void setUp() {
        createDto = NotificationCreateDto.builder()
                .userId(1L)
                .title("Test Notification")
                .message("Test Message")
                .type(NotificationType.APPOINTMENT_REMINDER)
                .relatedId(100L)
                .relatedType("appointment")
                .build();

        notification = Notification.builder()
                .id(1L)
                .userId(1L)
                .userName("John Doe")
                .title("Test Notification")
                .message("Test Message")
                .type(NotificationType.APPOINTMENT_REMINDER)
                .isRead(false)
                .relatedId(100L)
                .relatedType("appointment")
                .createdAt(LocalDateTime.now())
                .build();

        responseDto = NotificationResponseDto.builder()
                .id(1L)
                .userId(1L)
                .userName("John Doe")
                .title("Test Notification")
                .message("Test Message")
                .type(NotificationType.APPOINTMENT_REMINDER)
                .isRead(false)
                .relatedId(100L)
                .relatedType("appointment")
                .createdAt(LocalDateTime.now())
                .build();

        userDto = UserDto.builder()
                .id(1L)
                .fullName("John Doe")
                .email("john@example.com")
                .phone("1234567890")
                .role("PATIENT")
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should create notification successfully")
    void testCreateNotification_Success() {
        // Given
        when(userServiceClient.getUserById(1L)).thenReturn(userDto);
        when(notificationMapper.toEntity(createDto)).thenReturn(notification);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(notificationMapper.toDto(notification)).thenReturn(responseDto);

        // When
        NotificationResponseDto result = notificationService.createNotification(createDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUserName()).isEqualTo("John Doe");
        assertThat(result.getTitle()).isEqualTo("Test Notification");

        verify(userServiceClient).getUserById(1L);
        verify(notificationMapper).toEntity(createDto);
        verify(notificationRepository).save(any(Notification.class));
        verify(notificationMapper).toDto(notification);
    }

    @Test
    @DisplayName("Should set user name when creating notification")
    void testCreateNotification_SetsUserName() {
        // Given
        when(userServiceClient.getUserById(1L)).thenReturn(userDto);
        when(notificationMapper.toEntity(createDto)).thenReturn(notification);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(notificationMapper.toDto(notification)).thenReturn(responseDto);

        // When
        notificationService.createNotification(createDto);

        // Then
        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notificationCaptor.capture());
        assertThat(notificationCaptor.getValue().getUserName()).isEqualTo("John Doe");
    }

    @Test
    @DisplayName("Should get notification by id successfully")
    void testGetNotificationById_Success() {
        // Given
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationMapper.toDto(notification)).thenReturn(responseDto);

        // When
        NotificationResponseDto result = notificationService.getNotificationById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);

        verify(notificationRepository).findById(1L);
        verify(notificationMapper).toDto(notification);
    }

    @Test
    @DisplayName("Should throw exception when notification not found by id")
    void testGetNotificationById_NotFound() {
        // Given
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> notificationService.getNotificationById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Không tìm thấy thông báo");

        verify(notificationRepository).findById(999L);
        verifyNoInteractions(notificationMapper);
    }

    @Test
    @DisplayName("Should get notifications by user id with pagination")
    void testGetNotificationsByUserId_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> notificationPage = new PageImpl<>(List.of(notification));

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L, pageable)).thenReturn(notificationPage);
        when(notificationMapper.toDto(notification)).thenReturn(responseDto);

        // When
        Page<NotificationResponseDto> result = notificationService.getNotificationsByUserId(1L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo(1L);

        verify(notificationRepository).findByUserIdOrderByCreatedAtDesc(1L, pageable);
    }

    @Test
    @DisplayName("Should get unread notifications by user id")
    void testGetUnreadNotificationsByUserId_Success() {
        // Given
        List<Notification> notifications = List.of(notification);

        when(notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(1L)).thenReturn(notifications);
        when(notificationMapper.toDtoList(notifications)).thenReturn(List.of(responseDto));

        // When
        List<NotificationResponseDto> result = notificationService.getUnreadNotificationsByUserId(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getIsRead()).isFalse();

        verify(notificationRepository).findByUserIdAndIsReadFalseOrderByCreatedAtDesc(1L);
        verify(notificationMapper).toDtoList(notifications);
    }

    @Test
    @DisplayName("Should get notifications by user id and read status")
    void testGetNotificationsByUserIdAndReadStatus_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> notificationPage = new PageImpl<>(List.of(notification));

        when(notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(1L, false, pageable))
                .thenReturn(notificationPage);
        when(notificationMapper.toDto(notification)).thenReturn(responseDto);

        // When
        Page<NotificationResponseDto> result = notificationService.getNotificationsByUserIdAndReadStatus(1L, false, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);

        verify(notificationRepository).findByUserIdAndIsReadOrderByCreatedAtDesc(1L, false, pageable);
    }

    @Test
    @DisplayName("Should count unread notifications by user id")
    void testCountUnreadByUserId_Success() {
        // Given
        when(notificationRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(5L);

        // When
        long count = notificationService.countUnreadByUserId(1L);

        // Then
        assertThat(count).isEqualTo(5L);

        verify(notificationRepository).countByUserIdAndIsReadFalse(1L);
    }

    @Test
    @DisplayName("Should get notifications by user id and type")
    void testGetNotificationsByUserIdAndType_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> notificationPage = new PageImpl<>(List.of(notification));

        when(notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(1L, NotificationType.APPOINTMENT_REMINDER, pageable))
                .thenReturn(notificationPage);
        when(notificationMapper.toDto(notification)).thenReturn(responseDto);

        // When
        Page<NotificationResponseDto> result = notificationService.getNotificationsByUserIdAndType(
                1L, NotificationType.APPOINTMENT_REMINDER, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getType()).isEqualTo(NotificationType.APPOINTMENT_REMINDER);

        verify(notificationRepository).findByUserIdAndTypeOrderByCreatedAtDesc(
                1L, NotificationType.APPOINTMENT_REMINDER, pageable);
    }

    @Test
    @DisplayName("Should get notifications by user id and related id")
    void testGetNotificationsByUserIdAndRelatedId_Success() {
        // Given
        List<Notification> notifications = List.of(notification);

        when(notificationRepository.findByUserIdAndRelatedIdOrderByCreatedAtDesc(1L, 100L))
                .thenReturn(notifications);
        when(notificationMapper.toDtoList(notifications)).thenReturn(List.of(responseDto));

        // When
        List<NotificationResponseDto> result = notificationService.getNotificationsByUserIdAndRelatedId(1L, 100L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRelatedId()).isEqualTo(100L);

        verify(notificationRepository).findByUserIdAndRelatedIdOrderByCreatedAtDesc(1L, 100L);
        verify(notificationMapper).toDtoList(notifications);
    }

    @Test
    @DisplayName("Should update notification successfully")
    void testUpdateNotification_Success() {
        // Given
        NotificationUpdateDto updateDto = NotificationUpdateDto.builder()
                .isRead(true)
                .build();

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(notificationMapper.toDto(notification)).thenReturn(responseDto);

        // When
        NotificationResponseDto result = notificationService.updateNotification(1L, updateDto);

        // Then
        assertThat(result).isNotNull();

        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(any(Notification.class));
        verify(notificationMapper).toDto(notification);
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent notification")
    void testUpdateNotification_NotFound() {
        // Given
        NotificationUpdateDto updateDto = NotificationUpdateDto.builder()
                .isRead(true)
                .build();

        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> notificationService.updateNotification(999L, updateDto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Không tìm thấy thông báo");

        verify(notificationRepository).findById(999L);
        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should mark notification as read successfully")
    void testMarkAsRead_Success() {
        // Given
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(notificationMapper.toDto(notification)).thenReturn(responseDto);

        // When
        NotificationResponseDto result = notificationService.markAsRead(1L);

        // Then
        assertThat(result).isNotNull();

        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notificationCaptor.capture());
        verify(notificationMapper).toDto(notification);
    }

    @Test
    @DisplayName("Should throw exception when marking non-existent notification as read")
    void testMarkAsRead_NotFound() {
        // Given
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> notificationService.markAsRead(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Không tìm thấy thông báo");

        verify(notificationRepository).findById(999L);
        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should mark all notifications as read for user")
    void testMarkAllAsReadByUserId_Success() {
        // Given
        when(notificationRepository.markAllAsReadByUserId(1L)).thenReturn(3);

        // When
        notificationService.markAllAsReadByUserId(1L);

        // Then
        verify(notificationRepository).markAllAsReadByUserId(1L);
    }

    @Test
    @DisplayName("Should delete notification successfully")
    void testDeleteNotification_Success() {
        // Given
        when(notificationRepository.existsById(1L)).thenReturn(true);
        doNothing().when(notificationRepository).deleteById(1L);

        // When
        notificationService.deleteNotification(1L);

        // Then
        verify(notificationRepository).existsById(1L);
        verify(notificationRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent notification")
    void testDeleteNotification_NotFound() {
        // Given
        when(notificationRepository.existsById(999L)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> notificationService.deleteNotification(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Không tìm thấy thông báo");

        verify(notificationRepository).existsById(999L);
        verify(notificationRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Should delete all notifications for user")
    void testDeleteAllNotificationsByUserId_Success() {
        // Given
        Notification notification1 = Notification.builder().id(1L).userId(1L).build();
        Notification notification2 = Notification.builder().id(2L).userId(1L).build();
        Notification notification3 = Notification.builder().id(3L).userId(2L).build();

        when(notificationRepository.count()).thenReturn(3L);
        when(notificationRepository.findAll()).thenReturn(Arrays.asList(notification1, notification2, notification3));
        doNothing().when(notificationRepository).deleteAll(anyList());

        // When
        notificationService.deleteAllNotificationsByUserId(1L);

        // Then
        verify(notificationRepository).findAll();
        verify(notificationRepository).deleteAll(anyList());
    }

    @Test
    @DisplayName("Should handle empty result when getting notifications by user id")
    void testGetNotificationsByUserId_EmptyResult() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> emptyPage = new PageImpl<>(List.of());

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(999L, pageable)).thenReturn(emptyPage);

        // When
        Page<NotificationResponseDto> result = notificationService.getNotificationsByUserId(999L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();

        verify(notificationRepository).findByUserIdOrderByCreatedAtDesc(999L, pageable);
    }

    @Test
    @DisplayName("Should handle update with null isRead value")
    void testUpdateNotification_NullIsRead() {
        // Given
        NotificationUpdateDto updateDto = NotificationUpdateDto.builder()
                .isRead(null)
                .build();

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(notificationMapper.toDto(notification)).thenReturn(responseDto);

        // When
        NotificationResponseDto result = notificationService.updateNotification(1L, updateDto);

        // Then
        assertThat(result).isNotNull();

        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(any(Notification.class));
    }
}
