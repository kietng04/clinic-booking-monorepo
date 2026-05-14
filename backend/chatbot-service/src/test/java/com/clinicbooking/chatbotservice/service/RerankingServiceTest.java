package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RerankingServiceTest {

    private RerankingService service;

    @BeforeEach
    void setUp() {
        service = new RerankingService();
        ReflectionTestUtils.setField(service, "topK", 3);
    }

    @Test
    void shouldMergeLexicalAndVectorScoresForSameDocument() {
        KnowledgeDocument document = new KnowledgeDocument(
                "CLINIC_WORKING_HOURS",
                "CLINIC_HOURS",
                "Gio lam viec phong kham",
                "Phong kham lam viec tu 07:30 den 20:00.",
                List.of("gio lam viec", "mo cua")
        );

        RetrievedKnowledge lexical = new RetrievedKnowledge(document, 0.45, List.of("gio lam viec"));
        RetrievedKnowledge semantic = new RetrievedKnowledge(document, 0.80, List.of());

        var results = service.rerank(
                "khi nao phong kham hoat dong",
                "CLINIC_HOURS",
                List.of(lexical),
                List.of(semantic)
        );

        assertThat(results).hasSize(1);
        assertThat(results.get(0).document().id()).isEqualTo("CLINIC_WORKING_HOURS");
        assertThat(results.get(0).score()).isGreaterThan(0.80);
        assertThat(results.get(0).matchedTerms()).contains("gio lam viec", "semantic");
    }

    @Test
    void shouldPreferIntentAlignedDocument() {
        RetrievedKnowledge correctIntent = new RetrievedKnowledge(
                new KnowledgeDocument("DOC_1", "CLINIC_HOURS", "Gio lam viec", "Phong kham mo cua 07:30.", List.of("gio")),
                0.40,
                List.of("gio")
        );
        RetrievedKnowledge fallbackUnknown = new RetrievedKnowledge(
                new KnowledgeDocument("DOC_2", "UNKNOWN", "Gioi thieu", "Phong kham co chatbot.", List.of("chatbot")),
                0.70,
                List.of("chatbot")
        );

        var results = service.rerank(
                "gio mo cua phong kham",
                "CLINIC_HOURS",
                List.of(correctIntent),
                List.of(fallbackUnknown)
        );

        assertThat(results.get(0).document().id()).isEqualTo("DOC_1");
    }
}
