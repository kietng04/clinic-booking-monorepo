package com.clinicbooking.appointmentservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_user_created", columnList = "user_id, created_at"),
        @Index(name = "idx_user_read", columnList = "user_id, is_read")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reference to User Service (no JPA relationship)
    @Column(name = "user_id", nullable = false)
    @NotNull(message = "User không được để trống")
    private Long userId;

    // Denormalized data
    @Column(name = "user_name")
    private String userName;

    @Column(nullable = false)
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Nội dung không được để trống")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private NotificationType type = NotificationType.SYSTEM;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "related_id")
    private Long relatedId;

    @Column(name = "related_type", length = 50)
    private String relatedType;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        APPOINTMENT_REMINDER,
        APPOINTMENT_CONFIRMED,
        APPOINTMENT_CANCELLED,
        APPOINTMENT_COMPLETED,
        FEEDBACK_AVAILABLE,
        APPOINTMENT_RESCHEDULED,
        PRESCRIPTION_READY,
        PAYMENT_REMINDER,
        DOCUMENT_READY,
        SCHEDULE_UPDATE,
        ALERT,
        SYSTEM
    }

    public void markAsRead() {
        isRead = true;
    }

    public boolean isUnread() {
        return Boolean.FALSE.equals(isRead);
    }
}
