package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.exception.AIProviderException;
import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiEmbeddingService implements EmbeddingService {

    private final RestTemplate restTemplate;

    @Value("${ai.gemini.api-key:}")
    private String apiKey;

    @Value("${ai.embedding.model:gemini-embedding-001}")
    private String model;

    @Value("${ai.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    @Value("${ai.embedding.enabled:true}")
    private boolean enabled;

    @Override
    public Optional<List<Double>> embed(String text, EmbeddingTask task) {
        if (!enabled || apiKey == null || apiKey.isBlank() || text == null || text.isBlank()) {
            return Optional.empty();
        }

        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .pathSegment("models", model + ":embedContent")
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", apiKey);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", "models/" + model);
        requestBody.put("taskType", task.name());
        requestBody.put("content", Map.of(
                "parts", List.of(Map.of("text", text))
        ));

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(requestBody, headers),
                    JsonNode.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new AIProviderException("Gemini embedding request failed");
            }

            JsonNode values = response.getBody().path("embedding").path("values");
            if (!values.isArray() || values.isEmpty()) {
                return Optional.empty();
            }

            List<Double> embedding = new java.util.ArrayList<>();
            values.forEach(value -> embedding.add(value.asDouble()));
            return Optional.of(List.copyOf(embedding));
        } catch (RestClientException ex) {
            log.warn("Gemini embedding failed: {}", describeRestClientError(ex));
            return Optional.empty();
        }
    }

    private String describeRestClientError(RestClientException ex) {
        if (ex instanceof RestClientResponseException responseException) {
            return responseException.getStatusCode() + " " + responseException.getResponseBodyAsString();
        }
        return ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();
    }
}
