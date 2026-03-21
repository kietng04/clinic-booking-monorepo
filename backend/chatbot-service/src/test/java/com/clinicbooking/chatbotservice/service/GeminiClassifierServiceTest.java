package com.clinicbooking.chatbotservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GeminiClassifierServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private IntentCatalogService intentCatalogService;

    private GeminiClassifierService service;

    @BeforeEach
    void setUp() {
        service = new GeminiClassifierService(restTemplate, new ObjectMapper(), intentCatalogService);
        ReflectionTestUtils.setField(service, "baseUrl", "https://generativelanguage.googleapis.com/v1beta");
        ReflectionTestUtils.setField(service, "model", "gemini-flash-latest");
        ReflectionTestUtils.setField(service, "maxOutputTokens", 256);
        ReflectionTestUtils.setField(service, "temperature", 0.1d);
        ReflectionTestUtils.setField(service, "retryMaxAttempts", 2);
        ReflectionTestUtils.setField(service, "retryBackoffMs", 0L);
    }

    @Test
    void shouldParseValidJsonPayload() {
        String payload = """
                {"intentId":"SERVICE_PRICE","confidence":0.72,"reason":"mentions price"}
                """;

        Optional<?> result = service.parseClassificationPayload(payload);

        assertThat(result).isPresent();
    }

    @Test
    void shouldParseJsonInsideCodeBlock() {
        String payload = """
                ```json
                {"intentId":"BOOK_APPOINTMENT","confidence":0.91,"reason":"booking request"}
                ```
                """;

        var result = service.parseClassificationPayload(payload);

        assertThat(result).isPresent();
        assertThat(result.get().intentId()).isEqualTo("BOOK_APPOINTMENT");
    }

    @Test
    void shouldReturnEmptyWhenPayloadNotJson() {
        var result = service.parseClassificationPayload("intent is book appointment");

        assertThat(result).isEmpty();
    }

    @Test
    void shouldSkipGeminiCallWhenApiKeyMissing() {
        ReflectionTestUtils.setField(service, "apiKey", "");

        var result = service.classify("toi muon dat lich", "toi muon dat lich", "PATIENT");

        assertThat(result).isEmpty();
    }

    @Test
    void shouldRetryWhenGeminiRequestFailsTemporarily() throws Exception {
        ReflectionTestUtils.setField(service, "apiKey", "test-key");

        String payload = """
                {"intentId":"CLINIC_HOURS","confidence":0.88,"reason":"hours question"}
                """;
        ObjectMapper objectMapper = new ObjectMapper();

        when(intentCatalogService.getIntents()).thenReturn(
                java.util.List.of(new com.clinicbooking.chatbotservice.model.IntentDefinition(
                        "CLINIC_HOURS",
                        "Gio mo cua phong kham",
                        "",
                        java.util.List.of()
                ))
        );
        when(intentCatalogService.findById("CLINIC_HOURS")).thenReturn(
                Optional.of(new com.clinicbooking.chatbotservice.model.IntentDefinition(
                        "CLINIC_HOURS",
                        "Gio mo cua phong kham",
                        "",
                        java.util.List.of()
                ))
        );
        when(restTemplate.exchange(
                any(String.class),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(com.fasterxml.jackson.databind.JsonNode.class)
        )).thenThrow(new ResourceAccessException("temporary"))
                .thenReturn(ResponseEntity.ok(objectMapper.readTree("""
                        {"candidates":[{"content":{"parts":[{"text":%s}]}}]}
                        """.formatted(objectMapper.writeValueAsString(payload)))));

        var result = service.classify("phong kham mo cua may gio", "phong kham mo cua may gio", "PATIENT");

        assertThat(result).isPresent();
        assertThat(result.get().intentId()).isEqualTo("CLINIC_HOURS");
        verify(restTemplate, times(2)).exchange(
                any(String.class),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(com.fasterxml.jackson.databind.JsonNode.class)
        );
    }

    @Test
    void shouldSendApiKeyInQueryParamAndRequestJsonResponse() throws Exception {
        ReflectionTestUtils.setField(service, "apiKey", "test-key");
        when(intentCatalogService.getIntents()).thenReturn(
                java.util.List.of(new com.clinicbooking.chatbotservice.model.IntentDefinition(
                        "CLINIC_HOURS",
                        "Gio mo cua phong kham",
                        "",
                        java.util.List.of()
                ))
        );
        when(intentCatalogService.findById("CLINIC_HOURS")).thenReturn(
                Optional.of(new com.clinicbooking.chatbotservice.model.IntentDefinition(
                        "CLINIC_HOURS",
                        "Gio mo cua phong kham",
                        "",
                        java.util.List.of()
                ))
        );

        ObjectMapper objectMapper = new ObjectMapper();
        String payload = """
                {"intentId":"CLINIC_HOURS","confidence":0.88,"reason":"hours question"}
                """;
        when(restTemplate.exchange(
                any(String.class),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(com.fasterxml.jackson.databind.JsonNode.class)
        )).thenReturn(ResponseEntity.ok(objectMapper.readTree("""
                {"candidates":[{"content":{"parts":[{"text":%s}]}}]}
                """.formatted(objectMapper.writeValueAsString(payload)))));

        var result = service.classify("phong kham mo cua may gio", "phong kham mo cua may gio", "PATIENT");

        assertThat(result).isPresent();

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<HttpEntity> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(
                urlCaptor.capture(),
                eq(HttpMethod.POST),
                entityCaptor.capture(),
                eq(com.fasterxml.jackson.databind.JsonNode.class)
        );

        assertThat(urlCaptor.getValue()).contains("models/gemini-flash-latest:generateContent");
        assertThat(urlCaptor.getValue()).contains("key=test-key");
        @SuppressWarnings("unchecked")
        var body = (java.util.Map<String, Object>) entityCaptor.getValue().getBody();
        @SuppressWarnings("unchecked")
        var generationConfig = (java.util.Map<String, Object>) body.get("generationConfig");
        assertThat(generationConfig.get("responseMimeType")).isEqualTo("application/json");
    }
}
