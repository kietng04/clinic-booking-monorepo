package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.RagEvaluationCase;
import com.clinicbooking.chatbotservice.model.RagEvaluationCaseResult;
import com.clinicbooking.chatbotservice.model.RagEvaluationReport;
import com.clinicbooking.chatbotservice.model.RagEvaluationSummary;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagEvaluationService {

    private final KnowledgeRetrievalService knowledgeRetrievalService;
    private final ObjectMapper objectMapper;

    @Value("${ai.rag.evaluation.dataset-path:rag/default-evaluation-dataset.json}")
    private String datasetPath;

    @Value("${ai.rag.top-k:3}")
    private int topK;

    public RagEvaluationReport evaluateDefaultDataset() {
        return evaluate(loadDataset());
    }

    public RagEvaluationReport evaluate(List<RagEvaluationCase> evaluationCases) {
        if (evaluationCases == null || evaluationCases.isEmpty()) {
            return new RagEvaluationReport(
                    new RagEvaluationSummary(0, Math.max(topK, 1), 0.0, 0.0, 0.0, 0.0),
                    List.of()
            );
        }

        List<RagEvaluationCaseResult> caseResults = evaluationCases.stream()
                .map(this::evaluateCase)
                .toList();

        double hitRate = average(caseResults.stream().map(result -> result.hitAtK() ? 1.0 : 0.0).toList());
        double meanPrecision = average(caseResults.stream().map(RagEvaluationCaseResult::precisionAtK).toList());
        double meanRecall = average(caseResults.stream().map(RagEvaluationCaseResult::recallAtK).toList());
        double meanReciprocalRank = average(caseResults.stream().map(RagEvaluationCaseResult::reciprocalRank).toList());

        return new RagEvaluationReport(
                new RagEvaluationSummary(
                        caseResults.size(),
                        Math.max(topK, 1),
                        hitRate,
                        meanPrecision,
                        meanRecall,
                        meanReciprocalRank
                ),
                caseResults
        );
    }

    public List<RagEvaluationCase> loadDataset() {
        try {
            ClassPathResource resource = new ClassPathResource(datasetPath);
            if (!resource.exists()) {
                log.warn("RAG evaluation dataset {} does not exist", datasetPath);
                return List.of();
            }

            try (InputStream inputStream = resource.getInputStream()) {
                return objectMapper.readValue(inputStream, new TypeReference<List<RagEvaluationCase>>() {
                });
            }
        } catch (Exception ex) {
            log.warn("Failed to load RAG evaluation dataset {}: {}", datasetPath, ex.getMessage());
            return List.of();
        }
    }

    private RagEvaluationCaseResult evaluateCase(RagEvaluationCase evaluationCase) {
        int effectiveTopK = Math.max(topK, 1);
        List<String> retrievedIds = knowledgeRetrievalService.retrieve(
                        evaluationCase.question(),
                        evaluationCase.intentId()
                ).stream()
                .limit(effectiveTopK)
                .map(item -> item.document().id())
                .toList();

        Set<String> expectedIds = evaluationCase.relevantDocumentIds() == null
                ? Set.of()
                : new LinkedHashSet<>(evaluationCase.relevantDocumentIds());

        long hits = retrievedIds.stream().filter(expectedIds::contains).count();
        double precisionAtK = (double) hits / (double) effectiveTopK;
        double recallAtK = expectedIds.isEmpty() ? 0.0 : (double) hits / (double) expectedIds.size();
        double reciprocalRank = reciprocalRank(retrievedIds, expectedIds);

        return new RagEvaluationCaseResult(
                evaluationCase.id(),
                evaluationCase.question(),
                evaluationCase.intentId(),
                List.copyOf(expectedIds),
                retrievedIds,
                precisionAtK,
                recallAtK,
                reciprocalRank,
                hits > 0
        );
    }

    private double reciprocalRank(List<String> retrievedIds, Set<String> expectedIds) {
        for (int index = 0; index < retrievedIds.size(); index++) {
            if (expectedIds.contains(retrievedIds.get(index))) {
                return 1.0 / (double) (index + 1);
            }
        }
        return 0.0;
    }

    private double average(List<Double> values) {
        if (values.isEmpty()) {
            return 0.0;
        }
        return values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }
}
