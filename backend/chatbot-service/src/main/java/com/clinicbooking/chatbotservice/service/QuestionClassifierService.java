package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.ClassifyQuestionResponse;
import com.clinicbooking.chatbotservice.model.IntentClassificationResult;
import com.clinicbooking.chatbotservice.model.IntentDefinition;
import com.clinicbooking.chatbotservice.util.TextNormalizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionClassifierService {

    private final IntentCatalogService intentCatalogService;
    private final RuleBasedClassifierService ruleBasedClassifierService;
    private final GeminiClassifierService geminiClassifierService;

    @Value("${ai.classifier.fallback-intent-id:UNKNOWN}")
    private String fallbackIntentId;

    public ClassifyQuestionResponse classify(String question, String userRole) {
        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException("question is required");
        }

        String normalizedQuestion = TextNormalizer.normalize(question);
        List<IntentDefinition> intents = intentCatalogService.getIntents();

        Optional<IntentClassificationResult> ruleResult =
                ruleBasedClassifierService.classify(normalizedQuestion, intents);

        if (ruleResult.isPresent()) {
            return toResponse(question, normalizedQuestion, ruleResult.get(), false);
        }

        Optional<IntentClassificationResult> geminiResult;
        try {
            geminiResult = geminiClassifierService.classify(question, normalizedQuestion, userRole);
        } catch (Exception ex) {
            log.warn("Gemini fallback failed: {}", ex.getMessage());
            geminiResult = Optional.empty();
        }

        if (geminiResult.isPresent()) {
            return toResponse(question, normalizedQuestion, geminiResult.get(), true);
        }

        IntentClassificationResult fallbackResult = new IntentClassificationResult(
                fallbackIntentId.toUpperCase(Locale.ROOT),
                0.0,
                "FALLBACK",
                "No deterministic match and Gemini unavailable or uncertain"
        );

        return toResponse(question, normalizedQuestion, fallbackResult, true);
    }

    private ClassifyQuestionResponse toResponse(
            String question,
            String normalizedQuestion,
            IntentClassificationResult result,
            boolean fallbackUsed
    ) {
        String intentName = intentCatalogService.findById(result.intentId())
                .map(IntentDefinition::name)
                .orElse("Unknown");

        return new ClassifyQuestionResponse(
                question,
                normalizedQuestion,
                result.intentId(),
                intentName,
                result.confidence(),
                result.provider(),
                fallbackUsed,
                result.reason()
        );
    }
}
