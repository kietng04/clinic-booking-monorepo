package com.clinicbooking.chatbotservice.model;

import java.util.List;

public record RagEvaluationCaseResult(
        String caseId,
        String question,
        String intentId,
        List<String> expectedDocumentIds,
        List<String> retrievedDocumentIds,
        double precisionAtK,
        double recallAtK,
        double reciprocalRank,
        boolean hitAtK
) {
}
