package com.clinicbooking.chatbotservice.dto;

public record ChatSource(
        String id,
        String title,
        String intentId,
        double score
) {
}
