package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KnowledgeRetrievalService {

    private final QueryExpansionService queryExpansionService;
    private final LexicalRetrievalService lexicalRetrievalService;
    private final VectorRetrievalService vectorRetrievalService;
    private final RerankingService rerankingService;

    @Value("${ai.rag.rerank-candidate-limit:8}")
    private int rerankCandidateLimit;

    public List<RetrievedKnowledge> retrieve(String normalizedQuestion, String intentId) {
        List<String> expandedQueries = queryExpansionService.expand(normalizedQuestion, intentId);
        if (expandedQueries.isEmpty()) {
            return List.of();
        }

        List<RetrievedKnowledge> lexicalResults = collectCandidates(expandedQueries, intentId, true);
        List<RetrievedKnowledge> vectorResults = collectCandidates(expandedQueries, intentId, false);

        return rerankingService.rerank(
                normalizedQuestion,
                intentId,
                lexicalResults,
                vectorResults
        );
    }

    private List<RetrievedKnowledge> collectCandidates(List<String> expandedQueries, String intentId, boolean lexical) {
        Map<String, RetrievedKnowledge> merged = new LinkedHashMap<>();
        for (String query : expandedQueries) {
            List<RetrievedKnowledge> results = lexical
                    ? lexicalRetrievalService.retrieve(query, intentId)
                    : vectorRetrievalService.retrieve(query, intentId);

            for (RetrievedKnowledge result : results) {
                if (result == null || result.document() == null || result.document().id() == null) {
                    continue;
                }

                merged.merge(result.document().id(), result, this::mergeResult);
            }
        }

        return merged.values().stream()
                .sorted((left, right) -> Double.compare(right.score(), left.score()))
                .limit(Math.max(rerankCandidateLimit, 1))
                .toList();
    }

    private RetrievedKnowledge mergeResult(RetrievedKnowledge current, RetrievedKnowledge candidate) {
        LinkedHashSet<String> matchedTerms = new LinkedHashSet<>();
        if (current.matchedTerms() != null) {
            matchedTerms.addAll(current.matchedTerms());
        }
        if (candidate.matchedTerms() != null) {
            matchedTerms.addAll(candidate.matchedTerms());
        }

        return new RetrievedKnowledge(
                current.document(),
                Math.max(current.score(), candidate.score()),
                List.copyOf(matchedTerms)
        );
    }
}
