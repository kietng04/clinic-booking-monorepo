package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import com.clinicbooking.chatbotservice.util.TextNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KnowledgeRetrievalService {

    private final KnowledgeBaseService knowledgeBaseService;

    @Value("${ai.rag.top-k:3}")
    private int topK;

    @Value("${ai.rag.min-score:0.08}")
    private double minScore;

    public List<RetrievedKnowledge> retrieve(String normalizedQuestion, String intentId) {
        if (normalizedQuestion == null || normalizedQuestion.isBlank()) {
            return List.of();
        }

        Set<String> queryTokens = tokenize(normalizedQuestion);
        if (queryTokens.isEmpty()) {
            return List.of();
        }

        return knowledgeBaseService.getDocuments().stream()
                .filter(doc -> shouldConsider(doc, intentId))
                .map(doc -> scoreDocument(doc, normalizedQuestion, queryTokens, intentId))
                .filter(item -> item.score() >= minScore)
                .sorted(Comparator.comparingDouble(RetrievedKnowledge::score).reversed())
                .limit(Math.max(topK, 1))
                .toList();
    }

    private boolean shouldConsider(KnowledgeDocument document, String intentId) {
        String safeIntent = intentId == null ? "UNKNOWN" : intentId.trim().toUpperCase(Locale.ROOT);
        String docIntent = document.intentId() == null ? "UNKNOWN" : document.intentId().trim().toUpperCase(Locale.ROOT);

        if ("UNKNOWN".equals(safeIntent)) {
            return true;
        }

        return docIntent.equals(safeIntent) || "UNKNOWN".equals(docIntent);
    }

    private RetrievedKnowledge scoreDocument(
            KnowledgeDocument document,
            String normalizedQuestion,
            Set<String> queryTokens,
            String intentId
    ) {
        List<String> matchedTerms = document.keywords() == null ? List.of() : document.keywords().stream()
                .map(TextNormalizer::normalize)
                .filter(k -> !k.isBlank() && normalizedQuestion.contains(k))
                .distinct()
                .toList();

        String normalizedTitle = TextNormalizer.normalize(document.title());
        String normalizedContent = TextNormalizer.normalize(document.content());
        Set<String> docTokens = tokenize(normalizedTitle + " " + normalizedContent + " "
                + (document.keywords() == null ? "" : String.join(" ", document.keywords())));

        double overlap = calculateOverlap(queryTokens, docTokens);
        double keywordScore = matchedTerms.isEmpty() ? 0.0 : Math.min(0.5, matchedTerms.size() * 0.2);
        double intentBoost = matchesIntent(document.intentId(), intentId) ? 0.12 : 0.0;

        double finalScore = Math.min(1.0, overlap * 0.6 + keywordScore + intentBoost);
        return new RetrievedKnowledge(document, finalScore, matchedTerms);
    }

    private boolean matchesIntent(String documentIntent, String askedIntent) {
        if (documentIntent == null || askedIntent == null) {
            return false;
        }
        return documentIntent.trim().equalsIgnoreCase(askedIntent.trim());
    }

    private double calculateOverlap(Set<String> queryTokens, Set<String> docTokens) {
        if (queryTokens.isEmpty() || docTokens.isEmpty()) {
            return 0.0;
        }

        long intersection = queryTokens.stream().filter(docTokens::contains).count();
        return (double) intersection / (double) queryTokens.size();
    }

    private Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) {
            return Set.of();
        }

        return Arrays.stream(text.split("\\s+"))
                .map(String::trim)
                .filter(token -> token.length() >= 2)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
