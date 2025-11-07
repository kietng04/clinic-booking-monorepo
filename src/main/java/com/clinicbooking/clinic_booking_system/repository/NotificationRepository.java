package com.clinicbooking.clinic_booking_system.repository;

import com.clinicbooking.clinic_booking_system.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);
    long countByUserIdAndIsReadFalse(Long userId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId " +
            "AND (:type IS NULL OR n.type = :type) " +
            "AND (:isRead IS NULL OR n.isRead = :isRead) " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> searchNotifications(
            @Param("userId") Long userId,
            @Param("type") Notification.NotificationType type,
            @Param("isRead") Boolean isRead,
            Pageable pageable);
}
