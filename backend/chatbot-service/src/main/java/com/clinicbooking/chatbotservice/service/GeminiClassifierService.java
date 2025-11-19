package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.exception.AIProviderException;
import com.clinicbooking.chatbotservice.model.IntentClassificationResult;
import com.clinicbooking.chatbotservice.model.IntentDefinition;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiClassifierService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final IntentCatalogService intentCatalogService;

    @Value("${ai.gemini.api-key:}")
    private String apiKey;

    @Value("${ai.gemini.model:gemini-2.5-flash}")
    private String model;

    @Value("${ai.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    @Value("${ai.gemini.max-output-tokens:256}")
    private int maxOutputTokens;

    @Value("${ai.gemini.temperature:0.1}")
    private double temperature;

    public Optional<IntentClassificationResult> classify(
            String originalQuestion,
            String normalizedQuestion,
            String userRole
    ) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("GEMINI_API_KEY is empty, skip Gemini fallback");
            return Optional.empty();
        }

        String prompt = buildClassificationPrompt(originalQuestion, normalizedQuestion, userRole);
        String url = String.format("%s/models/%s:generateContent", baseUrl, model);

        Map<String, Object> requestBody = buildRequestBody(prompt);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(requestBody, headers),
                    JsonNode.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new AIProviderException("Gemini classify request failed");
            }

            String rawPayload = extractGeminiText(response.getBody());
            return parseClassificationPayload(rawPayload)
                    .filter(result -> intentCatalogService.findById(result.intentId()).isPresent());
        } catch (RestClientException ex) {
            throw new AIProviderException("Gemini service is unavailable", ex);
        }
    }

    Optional<IntentClassificationResult> parseClassificationPayload(String payload) {
        if (payload == null || payload.isBlank()) {
            return Optional.empty();
        }

        String jsonPayload = payload.trim();
        int start = jsonPayload.indexOf('{');
        int end = jsonPayload.lastIndexOf('}');
        if (start < 0 || end <= start) {
            return Optional.empty();
        }

        jsonPayload = jsonPayload.substring(start, end + 1);

        try {
            JsonNode root = objectMapper.readTree(jsonPayload);
            String intentId = root.path("intentId").asText("").trim().toUpperCase(Locale.ROOT);
            if (intentId.isBlank()) {
                return Optional.empty();
            }

            double confidence = root.path("confidence").asDouble(0.5);
            confidence = Math.max(0.0, Math.min(1.0, confidence));
            String reason = root.path("reason").asText("Gemini classified intent");

            return Optional.of(new IntentClassificationResult(intentId, confidence, "GEMINI", reason));
        } catch (Exception ex) {
            log.warn("Cannot parse Gemini classify payload: {}", payload);
            return Optional.empty();
        }
    }

    private Map<String, Object> buildRequestBody(String prompt) {
        Map<String, Object> generationConfig = new LinkedHashMap<>();
        generationConfig.put("temperature", temperature);
        generationConfig.put("maxOutputTokens", maxOutputTokens);

        Map<String, Object> part = new LinkedHashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new LinkedHashMap<>();
        content.put("role", "user");
        content.put("parts", List.of(part));

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("contents", List.of(content));
        requestBody.put("generationConfig", generationConfig);
        return requestBody;
    }

    private String extractGeminiText(JsonNode body) {
        return body
                .path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text")
                .asText("");
    }

    private String buildClassificationPrompt(String originalQuestion, String normalizedQuestion, String userRole) {
        List<IntentDefinition> intents = intentCatalogService.getIntents().stream()
                .filter(intent -> intent.id() != null)
                .toList();

        String intentsDescription = intents.stream()
                .map(intent -> String.format(
                        "- %s: %s | %s",
                        intent.id(),
                        intent.name() == null ? "" : intent.name(),
                        intent.description() == null ? "" : intent.description()
                ))
                .collect(Collectors.joining("\n"));

        return "You are an intent classifier for a clinic booking application.\n"
                + "Classify the user question into exactly one intentId from the list below.\n"
                + "If no intent matches, use UNKNOWN.\n"
                + "Return strict JSON only with keys: intentId, confidence, reason.\n"
                + "confidence must be between 0 and 1.\n\n"
                + "User role: " + (userRole == null ? "UNKNOWN" : userRole) + "\n"
                + "Original question: " + originalQuestion + "\n"
                + "Normalized question: " + normalizedQuestion + "\n\n"
                + "Intent list:\n"
                + intentsDescription;
    }
}
