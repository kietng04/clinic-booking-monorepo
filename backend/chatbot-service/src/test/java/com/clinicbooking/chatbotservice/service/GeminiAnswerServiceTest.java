package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.ClassifyQuestionResponse;
import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GeminiAnswerServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private GeminiAnswerService service;

    @BeforeEach
    void setUp() {
        service = new GeminiAnswerService(restTemplate);
        ReflectionTestUtils.setField(service, "apiKey", "test-key");
        ReflectionTestUtils.setField(service, "baseUrl", "https://generativelanguage.googleapis.com/v1beta");
        ReflectionTestUtils.setField(service, "model", "gemini-flash-latest");
        ReflectionTestUtils.setField(service, "maxOutputTokens", 512);
        ReflectionTestUtils.setField(service, "temperature", 0.2d);
        ReflectionTestUtils.setField(service, "retryMaxAttempts", 2);
        ReflectionTestUtils.setField(service, "retryBackoffMs", 0L);
    }

    @Test
    void shouldRetryWhenGeminiAnswerFailsTemporarily() throws Exception {
        ClassifyQuestionResponse classification = new ClassifyQuestionResponse(
                "Phong kham mo cua may gio?",
                "phong kham mo cua may gio",
                "CLINIC_HOURS",
                "Gio mo cua phong kham",
                0.91,
                "GEMINI",
                false,
                "llm"
        );
        RetrievedKnowledge knowledge = new RetrievedKnowledge(
                new KnowledgeDocument(
                        "CLINIC_WORKING_HOURS",
                        "CLINIC_HOURS",
                        "Gio lam viec phong kham",
                        "Phong kham lam viec tu 07:30 den 20:00 tu thu hai den thu bay, chu nhat tu 08:00 den 17:00.",
                        List.of("gio mo cua")
                ),
                0.92,
                List.of("gio mo cua")
        );
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode successBody = objectMapper.readTree("""
                {"candidates":[{"content":{"parts":[{"text":"Phòng khám làm việc từ 07:30 đến 20:00."}]}}]}
                """);

        when(restTemplate.exchange(
                any(String.class),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(JsonNode.class)
        )).thenThrow(new ResourceAccessException("temporary"))
                .thenReturn(ResponseEntity.ok(successBody));

        var result = service.generateAnswer(
                "Phong kham mo cua may gio?",
                "PATIENT",
                classification,
                List.of(knowledge)
        );

        assertThat(result).contains("Phòng khám làm việc từ 07:30 đến 20:00.");
        verify(restTemplate, times(2)).exchange(
                any(String.class),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(JsonNode.class)
        );
    }

    @Test
    void shouldSendApiKeyInQueryParam() throws Exception {
        ClassifyQuestionResponse classification = new ClassifyQuestionResponse(
                "Gia kham tong quat bao nhieu?",
                "gia kham tong quat bao nhieu",
                "SERVICE_PRICE",
                "Gia dich vu",
                0.93,
                "GEMINI",
                false,
                "llm"
        );
        RetrievedKnowledge knowledge = new RetrievedKnowledge(
                new KnowledgeDocument(
                        "GENERAL_CONSULTATION_FEE",
                        "SERVICE_PRICE",
                        "Gia kham tong quat",
                        "Gia kham tong quat tu 200000 VND.",
                        List.of("gia kham")
                ),
                0.95,
                List.of("gia kham")
        );
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode successBody = objectMapper.readTree("""
                {"candidates":[{"content":{"parts":[{"text":"Giá khám tổng quát từ 200000 VND."}]}}]}
                """);

        when(restTemplate.exchange(
                any(String.class),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(JsonNode.class)
        )).thenReturn(ResponseEntity.ok(successBody));

        var result = service.generateAnswer(
                "Gia kham tong quat bao nhieu?",
                "PATIENT",
                classification,
                List.of(knowledge)
        );

        assertThat(result).contains("Giá khám tổng quát từ 200000 VND.");

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        verify(restTemplate).exchange(
                urlCaptor.capture(),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(JsonNode.class)
        );
        assertThat(urlCaptor.getValue()).contains("models/gemini-flash-latest:generateContent");
        assertThat(urlCaptor.getValue()).contains("key=test-key");
    }
}
