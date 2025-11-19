package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.IntentClassificationResult;
import com.clinicbooking.chatbotservice.model.IntentDefinition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuestionClassifierServiceTest {

    @Mock
    private IntentCatalogService intentCatalogService;

    @Mock
    private RuleBasedClassifierService ruleBasedClassifierService;

    @Mock
    private GeminiClassifierService geminiClassifierService;

    private QuestionClassifierService service;

    @BeforeEach
    void setUp() {
        service = new QuestionClassifierService(intentCatalogService, ruleBasedClassifierService, geminiClassifierService);
        ReflectionTestUtils.setField(service, "fallbackIntentId", "UNKNOWN");
    }

    @Test
    void shouldUseRuleMatchAndSkipGemini() {
        List<IntentDefinition> intents = List.of(
                new IntentDefinition("BOOK_APPOINTMENT", "Dat lich", "", List.of("dat lich")),
                new IntentDefinition("UNKNOWN", "Khong xac dinh", "", List.of())
        );

        when(intentCatalogService.getIntents()).thenReturn(intents);
        when(intentCatalogService.findById("BOOK_APPOINTMENT")).thenReturn(Optional.of(intents.get(0)));
        when(ruleBasedClassifierService.classify(any(), eq(intents)))
                .thenReturn(Optional.of(new IntentClassificationResult("BOOK_APPOINTMENT", 0.8, "RULE_BASED", "rule")));

        var response = service.classify("Toi muon dat lich", "PATIENT");

        assertThat(response.intentId()).isEqualTo("BOOK_APPOINTMENT");
        assertThat(response.provider()).isEqualTo("RULE_BASED");
        assertThat(response.fallbackUsed()).isFalse();
        verify(geminiClassifierService, never()).classify(any(), any(), any());
    }

    @Test
    void shouldUseGeminiWhenNoRuleMatch() {
        List<IntentDefinition> intents = List.of(
                new IntentDefinition("SERVICE_PRICE", "Gia dich vu", "", List.of("gia")),
                new IntentDefinition("UNKNOWN", "Khong xac dinh", "", List.of())
        );

        when(intentCatalogService.getIntents()).thenReturn(intents);
        when(ruleBasedClassifierService.classify(any(), eq(intents))).thenReturn(Optional.empty());
        when(geminiClassifierService.classify(any(), any(), any()))
                .thenReturn(Optional.of(new IntentClassificationResult("SERVICE_PRICE", 0.62, "GEMINI", "llm")));
        when(intentCatalogService.findById("SERVICE_PRICE")).thenReturn(Optional.of(intents.get(0)));

        var response = service.classify("Phi kham bao nhieu", "PATIENT");

        assertThat(response.intentId()).isEqualTo("SERVICE_PRICE");
        assertThat(response.provider()).isEqualTo("GEMINI");
        assertThat(response.fallbackUsed()).isTrue();
    }

    @Test
    void shouldFallbackToUnknownWhenNoRuleAndNoGeminiMatch() {
        List<IntentDefinition> intents = List.of(
                new IntentDefinition("UNKNOWN", "Khong xac dinh", "", List.of())
        );

        when(intentCatalogService.getIntents()).thenReturn(intents);
        when(ruleBasedClassifierService.classify(any(), eq(intents))).thenReturn(Optional.empty());
        when(geminiClassifierService.classify(any(), any(), any())).thenReturn(Optional.empty());
        when(intentCatalogService.findById("UNKNOWN")).thenReturn(Optional.of(intents.get(0)));

        var response = service.classify("toi dang hoi cau rat mo ho", "PATIENT");

        assertThat(response.intentId()).isEqualTo("UNKNOWN");
        assertThat(response.provider()).isEqualTo("FALLBACK");
        assertThat(response.fallbackUsed()).isTrue();
    }

    @Test
    void shouldRejectBlankQuestion() {
        assertThatThrownBy(() -> service.classify("   ", "PATIENT"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("question is required");
    }
}
