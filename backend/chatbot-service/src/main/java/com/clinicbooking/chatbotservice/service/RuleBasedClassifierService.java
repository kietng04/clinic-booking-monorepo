package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.IntentClassificationResult;
import com.clinicbooking.chatbotservice.model.IntentDefinition;
import com.clinicbooking.chatbotservice.util.TextNormalizer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@Slf4j
public class RuleBasedClassifierService {

    @Value("${ai.classifier.confidence-threshold:0.34}")
    private double confidenceThreshold;

    public Optional<IntentClassificationResult> classify(String normalizedQuestion, List<IntentDefinition> intents) {
        if (normalizedQuestion == null || normalizedQuestion.isBlank() || intents == null || intents.isEmpty()) {
            return Optional.empty();
        }

        String question = TextNormalizer.normalize(normalizedQuestion);
        IntentClassificationResult bestResult = null;
        int bestMatchedCount = 0;

        for (IntentDefinition intent : intents) {
            if (intent == null || intent.id() == null || "UNKNOWN".equals(intent.id())) {
                continue;
            }

            List<String> matchedKeywords = new ArrayList<>();
            List<String> keywords = intent.keywords() == null ? List.of() : intent.keywords();

            for (String keyword : keywords) {
                String normalizedKeyword = TextNormalizer.normalize(keyword);
                if (!normalizedKeyword.isBlank() && question.contains(normalizedKeyword)) {
                    matchedKeywords.add(keyword);
                }
            }

            int matchedCount = matchedKeywords.size();
            if (matchedCount == 0) {
                continue;
            }

            double confidence = Math.min(1.0, 0.4 + ((matchedCount - 1) * 0.2));
            if (confidence < confidenceThreshold) {
                continue;
            }

            IntentClassificationResult candidate = new IntentClassificationResult(
                    intent.id().toUpperCase(Locale.ROOT),
                    confidence,
                    "RULE_BASED",
                    "Matched keywords: " + String.join(", ", matchedKeywords)
            );

            if (bestResult == null
                    || candidate.confidence() > bestResult.confidence()
                    || (candidate.confidence() == bestResult.confidence() && matchedCount > bestMatchedCount)) {
                bestResult = candidate;
                bestMatchedCount = matchedCount;
            }
        }

        if (bestResult != null) {
            log.debug("Rule-based intent matched: {} ({})", bestResult.intentId(), bestResult.reason());
        }

        return Optional.ofNullable(bestResult);
    }
}
