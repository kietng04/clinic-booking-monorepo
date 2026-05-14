package com.clinicbooking.chatbotservice.model;

import java.util.List;

public record RagEvaluationCase(
        String id,
        String question,
        String intentId,
        List<String> relevantDocumentIds
) {
}
