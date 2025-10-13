package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.Notification;
import com.clinicbooking.appointmentservice.entity.Notification.NotificationType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("NotificationRepository Tests")
class NotificationRepositoryTest {

    @Autowired
    private NotificationRepository notificationRepository;

    private Notification notification1;
    private Notification notification2;
    private Notification notification3;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();

        notification1 = Notification.builder()
                .userId(1L)
                .userName("John Doe")
                .title("Appointment Reminder")
                .message("Your appointment is tomorrow")
                .type(NotificationType.APPOINTMENT_REMINDER)
                .isRead(false)
                .relatedId(100L)
                .relatedType("appointment")
                .build();

        notification2 = Notification.builder()
                .userId(1L)
                .userName("John Doe")
                .title("Appointment Alert")
                .message("Your appointment has been confirmed")
                .type(NotificationType.ALERT)
                .isRead(true)
                .relatedId(101L)
                .relatedType("appointment")
                .build();

        notification3 = Notification.builder()
                .userId(2L)
                .userName("Jane Smith")
                .title("System Alert")
                .message("System maintenance scheduled")
                .type(NotificationType.SYSTEM)
                .isRead(false)
                .build();

        notificationRepository.saveAll(List.of(notification1, notification2, notification3));
    }

    @Test
    @DisplayName("Should find notifications by userId ordered by createdAt desc")
    void testFindByUserIdOrderByCreatedAtDesc() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Notification> result = notificationRepository.findByUserIdOrderByCreatedAtDesc(1L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting("userId").containsOnly(1L);
    }

    @Test
    @DisplayName("Should find unread notifications by userId ordered by createdAt desc")
    void testFindByUserIdAndIsReadFalseOrderByCreatedAtDesc() {
        // When
        List<Notification> result = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(1L);
        assertThat(result.get(0).getIsRead()).isFalse();
    }

    @Test
    @DisplayName("Should find notifications by userId and read status with pagination")
    void testFindByUserIdAndIsReadOrderByCreatedAtDesc() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Notification> result = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(1L, false, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getIsRead()).isFalse();
    }

    @Test
    @DisplayName("Should count unread notifications by userId")
    void testCountByUserIdAndIsReadFalse() {
        // When
        long count = notificationRepository.countByUserIdAndIsReadFalse(1L);

        // Then
        assertThat(count).isEqualTo(1);
    }

    @Test
    @DisplayName("Should find notifications by userId and type")
    void testFindByUserIdAndTypeOrderByCreatedAtDesc() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Notification> result = notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(
                1L, NotificationType.APPOINTMENT_REMINDER, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getType()).isEqualTo(NotificationType.APPOINTMENT_REMINDER);
    }

    @Test
    @DisplayName("Should find notifications by userId and relatedId")
    void testFindByUserIdAndRelatedIdOrderByCreatedAtDesc() {
        // When
        List<Notification> result = notificationRepository.findByUserIdAndRelatedIdOrderByCreatedAtDesc(1L, 100L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRelatedId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("Should mark all unread notifications as read for a user")
    void testMarkAllAsReadByUserId() {
        // When
        int updatedCount = notificationRepository.markAllAsReadByUserId(1L);

        // Then
        assertThat(updatedCount).isEqualTo(1);

        // Verify all notifications are marked as read
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(1L);
        assertThat(unreadNotifications).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when no notifications found for userId")
    void testFindByUserIdOrderByCreatedAtDesc_NoResults() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Notification> result = notificationRepository.findByUserIdOrderByCreatedAtDesc(999L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    @DisplayName("Should return zero when counting unread notifications for user with no unread notifications")
    void testCountByUserIdAndIsReadFalse_NoUnread() {
        // When
        long count = notificationRepository.countByUserIdAndIsReadFalse(2L);

        // Then
        assertThat(count).isEqualTo(1); // notification3 is unread
    }

    @Test
    @DisplayName("Should save notification with all fields")
    void testSaveNotification() {
        // Given
        Notification notification = Notification.builder()
                .userId(3L)
                .userName("Test User")
                .title("Test Title")
                .message("Test Message")
                .type(NotificationType.ALERT)
                .isRead(false)
                .relatedId(200L)
                .relatedType("test")
                .build();

        // When
        Notification saved = notificationRepository.save(notification);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getUserId()).isEqualTo(3L);
        assertThat(saved.getTitle()).isEqualTo("Test Title");
        assertThat(saved.getMessage()).isEqualTo("Test Message");
        assertThat(saved.getType()).isEqualTo(NotificationType.ALERT);
        assertThat(saved.getIsRead()).isFalse();
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should handle pagination correctly")
    void testPagination() {
        // Given - create more notifications
        for (int i = 0; i < 15; i++) {
            Notification notification = Notification.builder()
                    .userId(10L)
                    .userName("Test User")
                    .title("Notification " + i)
                    .message("Message " + i)
                    .type(NotificationType.SYSTEM)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }

        // When
        Pageable firstPage = PageRequest.of(0, 5);
        Pageable secondPage = PageRequest.of(1, 5);

        Page<Notification> firstPageResult = notificationRepository.findByUserIdOrderByCreatedAtDesc(10L, firstPage);
        Page<Notification> secondPageResult = notificationRepository.findByUserIdOrderByCreatedAtDesc(10L, secondPage);

        // Then
        assertThat(firstPageResult.getContent()).hasSize(5);
        assertThat(secondPageResult.getContent()).hasSize(5);
        assertThat(firstPageResult.getTotalElements()).isEqualTo(15);
        assertThat(firstPageResult.getTotalPages()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should mark notification as read using entity method")
    void testMarkAsReadEntityMethod() {
        // Given
        Notification notification = notificationRepository.findById(notification1.getId()).orElseThrow();
        assertThat(notification.getIsRead()).isFalse();

        // When
        notification.markAsRead();
        Notification updated = notificationRepository.save(notification);

        // Then
        assertThat(updated.getIsRead()).isTrue();
    }

    @Test
    @DisplayName("Should check if notification is unread using entity method")
    void testIsUnreadEntityMethod() {
        // Given
        Notification unread = notificationRepository.findById(notification1.getId()).orElseThrow();
        Notification read = notificationRepository.findById(notification2.getId()).orElseThrow();

        // Then
        assertThat(unread.isUnread()).isTrue();
        assertThat(read.isUnread()).isFalse();
    }
}
