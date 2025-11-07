package com.clinicbooking.clinic_booking_system.dto.message;

import com.clinicbooking.clinic_booking_system.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponseDto {
    private Long id;
    private Long consultationId;
    private Long senderId;
    private String senderName;
    private String content;
    private Message.MessageType messageType;
    private String fileUrl;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
