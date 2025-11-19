package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.IntentDefinition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RuleBasedClassifierServiceTest {

    private RuleBasedClassifierService service;

    @BeforeEach
    void setUp() {
        service = new RuleBasedClassifierService();
        ReflectionTestUtils.setField(service, "confidenceThreshold", 0.34d);
    }

    @Test
    void shouldMatchBookAppointmentIntent() {
        List<IntentDefinition> intents = List.of(
                new IntentDefinition(
                        "BOOK_APPOINTMENT",
                        "Dat lich kham",
                        "Dat lich moi",
                        List.of("dat lich", "book appointment")
                ),
                new IntentDefinition("UNKNOWN", "Khong xac dinh", "Fallback", List.of())
        );

        var result = service.classify("toi muon dat lich kham voi bac si", intents);

        assertThat(result).isPresent();
        assertThat(result.get().intentId()).isEqualTo("BOOK_APPOINTMENT");
        assertThat(result.get().provider()).isEqualTo("RULE_BASED");
        assertThat(result.get().confidence()).isGreaterThanOrEqualTo(0.34d);
    }

    @Test
    void shouldReturnEmptyWhenNoKeywordMatch() {
        List<IntentDefinition> intents = List.of(
                new IntentDefinition(
                        "BOOK_APPOINTMENT",
                        "Dat lich kham",
                        "Dat lich moi",
                        List.of("dat lich", "book appointment")
                )
        );

        var result = service.classify("toi can biet ve khai niem rag", intents);

        assertThat(result).isEmpty();
    }
}
