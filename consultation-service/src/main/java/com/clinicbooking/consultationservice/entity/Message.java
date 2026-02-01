package com.clinicbooking.consultationservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing a chat message in a consultation
 */
@Entity
@Table(name = "messages", indexes = {
        @Index(name = "idx_consultation_id", columnList = "consultationId"),
        @Index(name = "idx_sender_id", columnList = "senderId"),
        @Index(name = "idx_sent_at", columnList = "sentAt")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID of the consultation this message belongs to
     */
    @Column(nullable = false)
    private Long consultationId;

    /**
     * ID of the user who sent this message (patient or doctor)
     */
    @Column(nullable = false)
    private Long senderId;

    /**
     * Name of the sender
     */
    @Column(nullable = false)
    private String senderName;

    /**
     * Role of the sender (PATIENT, DOCTOR)
     */
    @Column(nullable = false, length = 20)
    private String senderRole;

    /**
     * Type of message (TEXT, IMAGE, FILE, SYSTEM)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MessageType type = MessageType.TEXT;

    /**
     * Message content (text)
     */
    @Column(columnDefinition = "TEXT")
    private String content;

    /**
     * URL of attached file/image (if type is IMAGE or FILE)
     */
    private String fileUrl;

    /**
     * Original filename of attached file
     */
    private String fileName;

    /**
     * File size in bytes
     */
    private Long fileSize;

    /**
     * MIME type of file
     */
    private String fileMimeType;

    /**
     * Timestamp when message was sent
     */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime sentAt;

    /**
     * Whether the message has been read by recipient
     */
    @Builder.Default
    private Boolean isRead = false;

    /**
     * Timestamp when message was read
     */
    private LocalDateTime readAt;

    /**
     * Whether this message has been deleted
     */
    @Builder.Default
    private Boolean isDeleted = false;

    /**
     * Timestamp when message was deleted
     */
    private LocalDateTime deletedAt;
}
