package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.ClassifyQuestionResponse;
import com.clinicbooking.chatbotservice.exception.AIProviderException;
import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAnswerService {

    private final RestTemplate restTemplate;

    @Value("${ai.gemini.api-key:}")
    private String apiKey;

    @Value("${ai.gemini.model:gemini-2.5-flash}")
    private String model;

    @Value("${ai.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    @Value("${ai.gemini.answer-max-output-tokens:512}")
    private int maxOutputTokens;

    @Value("${ai.gemini.answer-temperature:0.2}")
    private double temperature;

    @Value("${ai.gemini.retry.max-attempts:3}")
    private int retryMaxAttempts;

    @Value("${ai.gemini.retry.backoff-ms:800}")
    private long retryBackoffMs;

    public Optional<String> generateAnswer(
            String question,
            String userRole,
            ClassifyQuestionResponse classification,
            List<RetrievedKnowledge> retrievedKnowledge
    ) {
        if (apiKey == null || apiKey.isBlank()) {
            return Optional.empty();
        }

        String prompt = buildAnswerPrompt(question, userRole, classification, retrievedKnowledge);
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .pathSegment("models", model + ":generateContent")
                .queryParam("key", apiKey)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = buildRequestBody(prompt);
        int attempts = Math.max(1, retryMaxAttempts);

        for (int attempt = 1; attempt <= attempts; attempt++) {
            try {
                ResponseEntity<JsonNode> response = restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        new HttpEntity<>(requestBody, headers),
                        JsonNode.class
                );

                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    throw new AIProviderException("Gemini answer request failed");
                }

                String generatedText = extractGeminiText(response.getBody()).trim();
                if (!generatedText.isBlank()) {
                    return Optional.of(generatedText);
                }

                log.warn("Gemini answer returned empty content on attempt {}/{}", attempt, attempts);
            } catch (RestClientException ex) {
                if (attempt == attempts) {
                    throw new AIProviderException("Gemini service is unavailable: " + describeRestClientError(ex), ex);
                }
                log.warn(
                        "Gemini answer attempt {}/{} failed: {}",
                        attempt,
                        attempts,
                        describeRestClientError(ex)
                );
            }

            sleepBeforeRetry(attempt, attempts);
        }

        return Optional.empty();
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

    private String buildAnswerPrompt(
            String question,
            String userRole,
            ClassifyQuestionResponse classification,
            List<RetrievedKnowledge> retrievedKnowledge
    ) {
        String context = retrievedKnowledge.isEmpty()
                ? "No retrieved context."
                : retrievedKnowledge.stream()
                .map(item -> String.format(
                        "[%s] %s\nintent=%s score=%.2f\n%s",
                        item.document().id(),
                        item.document().title(),
                        item.document().intentId(),
                        item.score(),
                        item.document().content()
                ))
                .collect(Collectors.joining("\n\n"));

        return "You are a clinic support assistant. "
                + "Reply in Vietnamese without markdown. "
                + "Use only retrieved context. "
                + "If context is insufficient, say that clearly and ask a follow-up question.\n\n"
                + "User role: " + (userRole == null ? "UNKNOWN" : userRole) + "\n"
                + "Detected intent: " + classification.intentId() + " (" + classification.intentName() + ")\n"
                + "Question: " + question + "\n\n"
                + "Retrieved context:\n" + context + "\n\n"
                + "Give one concise answer and practical next step.";
    }

    private void sleepBeforeRetry(int attempt, int attempts) {
        if (attempt >= attempts || retryBackoffMs <= 0) {
            return;
        }

        try {
            Thread.sleep(retryBackoffMs * attempt);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new AIProviderException("Gemini answer retry interrupted", ex);
        }
    }

    private String describeRestClientError(RestClientException ex) {
        if (ex instanceof RestClientResponseException responseException) {
            return responseException.getStatusCode() + " " + responseException.getResponseBodyAsString();
        }
        return ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();
    }
}
