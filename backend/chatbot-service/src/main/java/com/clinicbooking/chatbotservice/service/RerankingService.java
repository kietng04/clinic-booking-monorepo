package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import com.clinicbooking.chatbotservice.util.TextNormalizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class RerankingService {

    @Value("${ai.rag.top-k:3}")
    private int topK;

    public List<RetrievedKnowledge> rerank(
            String normalizedQuestion,
            String intentId,
            List<RetrievedKnowledge> lexicalResults,
            List<RetrievedKnowledge> vectorResults
    ) {
        Map<String, RetrievalAccumulator> merged = new LinkedHashMap<>();
        mergeResults(merged, lexicalResults, true);
        mergeResults(merged, vectorResults, false);

        return merged.values().stream()
                .map(accumulator -> accumulator.toRetrievedKnowledge(normalizedQuestion, intentId))
                .sorted((left, right) -> Double.compare(right.score(), left.score()))
                .limit(Math.max(topK, 1))
                .toList();
    }

    private void mergeResults(
            Map<String, RetrievalAccumulator> merged,
            List<RetrievedKnowledge> results,
            boolean lexical
    ) {
        if (results == null || results.isEmpty()) {
            return;
        }

        for (RetrievedKnowledge result : results) {
            if (result == null || result.document() == null || result.document().id() == null) {
                continue;
            }

            merged.computeIfAbsent(result.document().id(), ignored -> new RetrievalAccumulator(result.document()))
                    .merge(result, lexical);
        }
    }

    private static final class RetrievalAccumulator {
        private final KnowledgeDocument document;
        private final Set<String> matchedTerms = new LinkedHashSet<>();
        private double lexicalScore;
        private double vectorScore;
        private boolean hasLexicalSignal;
        private boolean hasVectorSignal;

        private RetrievalAccumulator(KnowledgeDocument document) {
            this.document = document;
        }

        private void merge(RetrievedKnowledge result, boolean lexical) {
            if (lexical) {
                lexicalScore = Math.max(lexicalScore, result.score());
                hasLexicalSignal = true;
            } else {
                vectorScore = Math.max(vectorScore, result.score());
                hasVectorSignal = true;
                matchedTerms.add("semantic");
            }

            if (result.matchedTerms() != null) {
                matchedTerms.addAll(result.matchedTerms());
            }
        }

        private RetrievedKnowledge toRetrievedKnowledge(String normalizedQuestion, String intentId) {
            double combinedScore = lexicalScore * 0.42 + vectorScore * 0.48;
            if (hasLexicalSignal && hasVectorSignal) {
                combinedScore += 0.18;
            }

            if (matchesIntent(document.intentId(), intentId)) {
                combinedScore += 0.18;
            }

            if (containsQuestionTerms(normalizedQuestion, document)) {
                combinedScore += 0.08;
            }

            return new RetrievedKnowledge(
                    document,
                    Math.min(1.0, combinedScore),
                    List.copyOf(new ArrayList<>(matchedTerms))
            );
        }

        private boolean matchesIntent(String documentIntent, String askedIntent) {
            if (documentIntent == null || askedIntent == null) {
                return false;
            }

            String normalizedDocumentIntent = documentIntent.trim().toUpperCase(Locale.ROOT);
            String normalizedAskedIntent = askedIntent.trim().toUpperCase(Locale.ROOT);
            if ("UNKNOWN".equals(normalizedDocumentIntent) || "UNKNOWN".equals(normalizedAskedIntent)) {
                return false;
            }

            return normalizedDocumentIntent.equals(normalizedAskedIntent);
        }

        private boolean containsQuestionTerms(String normalizedQuestion, KnowledgeDocument knowledgeDocument) {
            String docText = TextNormalizer.normalize(knowledgeDocument.title() + " " + knowledgeDocument.content());
            String[] tokens = TextNormalizer.normalize(normalizedQuestion).split("\\s+");
            int matches = 0;
            for (String token : tokens) {
                if (token.length() < 3) {
                    continue;
                }
                if (docText.contains(token)) {
                    matches++;
                }
            }
            return matches >= 2;
        }
    }
}
