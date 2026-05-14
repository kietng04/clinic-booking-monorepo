package com.clinicbooking.chatbotservice.model;

import java.util.List;

public record RagEvaluationReport(
        RagEvaluationSummary summary,
        List<RagEvaluationCaseResult> cases
) {
}
