package com.clinicbooking.chatbotservice.dto;

public record ClassifyQuestionResponse(
        String question,
        String normalizedQuestion,
        String intentId,
        String intentName,
        double confidence,
        String provider,
        boolean fallbackUsed,
        String reason
) {
}
