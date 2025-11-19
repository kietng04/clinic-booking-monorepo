package com.clinicbooking.chatbotservice.dto;

import java.util.List;

public record ChatResponse(
        String question,
        String normalizedQuestion,
        String answer,
        String intentId,
        String intentName,
        double confidence,
        String classifierProvider,
        boolean fallbackUsed,
        String answerProvider,
        boolean ragUsed,
        List<ChatSource> sources
) {
}
