package com.clinicbooking.chatbotservice.model;

import java.util.List;

public record RetrievedKnowledge(
        KnowledgeDocument document,
        double score,
        List<String> matchedTerms
) {
}
