package com.clinicbooking.chatbotservice.model;

import java.util.List;

public record KnowledgeDocument(
        String id,
        String intentId,
        String title,
        String content,
        List<String> keywords
) {
}
