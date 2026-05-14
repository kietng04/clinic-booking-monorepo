package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.util.TextNormalizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class QueryExpansionService {

    @Value("${ai.rag.expansion.enabled:true}")
    private boolean enabled;

    @Value("${ai.rag.expansion.max-queries:4}")
    private int maxQueries;

    public List<String> expand(String normalizedQuestion, String intentId) {
        if (normalizedQuestion == null || normalizedQuestion.isBlank()) {
            return List.of();
        }

        LinkedHashSet<String> expansions = new LinkedHashSet<>();
        expansions.add(normalizedQuestion);

        if (!enabled) {
            return List.copyOf(expansions);
        }

        String normalizedIntent = intentId == null ? "UNKNOWN" : intentId.trim().toUpperCase(Locale.ROOT);
        addIntentAwareVariants(expansions, normalizedQuestion, normalizedIntent);
        addGenericVariants(expansions, normalizedQuestion);

        return expansions.stream()
                .map(TextNormalizer::normalize)
                .filter(query -> !query.isBlank())
                .limit(Math.max(maxQueries, 1))
                .toList();
    }

    private void addIntentAwareVariants(Set<String> expansions, String normalizedQuestion, String normalizedIntent) {
        switch (normalizedIntent) {
            case "CLINIC_HOURS" -> {
                addReplacementVariants(expansions, normalizedQuestion, "mo cua may gio", "gio lam viec phong kham");
                addReplacementVariants(expansions, normalizedQuestion, "mo cua", "hoat dong");
                addReplacementVariants(expansions, normalizedQuestion, "dong cua", "ket thuc lam viec");
            }
            case "CLINIC_ADDRESS", "CLINIC_DIRECTORY" -> {
                addReplacementVariants(expansions, normalizedQuestion, "o dau", "dia chi phong kham");
                addReplacementVariants(expansions, normalizedQuestion, "chi nhanh", "co so phong kham");
            }
            case "SERVICE_PRICE" -> {
                addReplacementVariants(expansions, normalizedQuestion, "bao nhieu", "chi phi");
                addReplacementVariants(expansions, normalizedQuestion, "gia", "bang gia");
            }
            case "SERVICE_CATALOG" -> addReplacementVariants(expansions, normalizedQuestion, "dich vu", "goi kham");
            case "BOOK_APPOINTMENT" -> {
                addReplacementVariants(expansions, normalizedQuestion, "dat lich", "hen kham");
                addReplacementVariants(expansions, normalizedQuestion, "lich kham", "khung gio kham");
            }
            case "SPECIALTY_CONSULTATION" -> {
                addReplacementVariants(expansions, normalizedQuestion, "khoa nao", "chuyen khoa nao");
                addReplacementVariants(expansions, normalizedQuestion, "nen kham khoa", "goi y chuyen khoa");
            }
            default -> {
            }
        }
    }

    private void addGenericVariants(Set<String> expansions, String normalizedQuestion) {
        addReplacementVariants(expansions, normalizedQuestion, "phong kham", "co so y te");
        addReplacementVariants(expansions, normalizedQuestion, "bac si", "chuyen gia");
        addReplacementVariants(expansions, normalizedQuestion, "dat lich", "dang ky kham");
    }

    private void addReplacementVariants(
            Set<String> expansions,
            String normalizedQuestion,
            String sourcePhrase,
            String replacementPhrase
    ) {
        if (!normalizedQuestion.contains(sourcePhrase)) {
            return;
        }

        expansions.add(normalizedQuestion.replace(sourcePhrase, replacementPhrase));
        expansions.add(replacementPhrase + " " + normalizedQuestion);
    }
}
