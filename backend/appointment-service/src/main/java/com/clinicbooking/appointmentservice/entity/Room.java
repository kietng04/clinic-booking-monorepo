package com.clinicbooking.appointmentservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rooms", indexes = {
        @Index(name = "idx_room_clinic", columnList = "clinic_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clinic_id", nullable = false)
    private Long clinicId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "room_number", length = 50)
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private RoomType type;

    @Column
    private Integer capacity;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum RoomType {
        // Existing room types used by the application.
        CONSULTATION, LAB, IMAGING, PROCEDURE,
        // Backward compatibility with seeded/legacy data.
        EXAMINATION
    }
}
