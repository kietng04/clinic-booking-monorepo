package com.clinicbooking.consultationservice.dto;

import com.clinicbooking.consultationservice.entity.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for chat message
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {

    private Long id;
    private Long consultationId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private MessageType type;
    private String content;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String fileMimeType;
    private LocalDateTime sentAt;
    private Boolean isRead;
    private LocalDateTime readAt;
}
