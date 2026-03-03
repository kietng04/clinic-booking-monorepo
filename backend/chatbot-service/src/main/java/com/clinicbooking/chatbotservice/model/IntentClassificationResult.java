package com.clinicbooking.chatbotservice.model;

public record IntentClassificationResult(
        String intentId,
        double confidence,
        String provider,
        String reason
) {
}
