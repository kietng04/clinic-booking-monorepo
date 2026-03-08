package com.clinicbooking.chatbotservice.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ChatSessionMessageResponse(
        String id,
        String sessionId,
        String role,
        String text,
        String answerProvider,
        boolean ragUsed,
        LocalDateTime createdAt,
        List<ChatSource> sources
) {
}
