package com.clinicbooking.chatbotservice.model;

import java.util.List;

public record KnowledgeChunkRow(
        String knowledgeId,
        String intentId,
        String title,
        String content,
        List<String> keywords,
        String sourceType
) {
}
