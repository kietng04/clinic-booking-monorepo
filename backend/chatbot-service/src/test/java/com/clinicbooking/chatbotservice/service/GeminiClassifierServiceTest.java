package com.clinicbooking.chatbotservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

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
}
