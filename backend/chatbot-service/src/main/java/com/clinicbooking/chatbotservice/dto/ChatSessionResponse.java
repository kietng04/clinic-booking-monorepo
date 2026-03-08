package com.clinicbooking.chatbotservice.dto;

import java.time.LocalDateTime;

public record ChatSessionResponse(
        String id,
        Long userId,
        String userRole,
        String title,
        String lastMessagePreview,
        long messageCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
