package com.clinicbooking.chatbotservice.model;

public record RagEvaluationSummary(
        int totalCases,
        int topK,
        double hitRateAtK,
        double meanPrecisionAtK,
        double meanRecallAtK,
        double meanReciprocalRank
) {
}
