package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.ClassifyQuestionResponse;
import com.clinicbooking.chatbotservice.exception.AIProviderException;
import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
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
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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
        String url = String.format("%s/models/%s:generateContent", baseUrl, model);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(buildRequestBody(prompt), headers),
                    JsonNode.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new AIProviderException("Gemini answer request failed");
            }

            String generatedText = extractGeminiText(response.getBody()).trim();
            if (generatedText.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(generatedText);
        } catch (RestClientException ex) {
            throw new AIProviderException("Gemini service is unavailable", ex);
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
}
