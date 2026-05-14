package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import com.clinicbooking.chatbotservice.model.RagEvaluationCase;
import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RagEvaluationServiceTest {

    @Mock
    private KnowledgeRetrievalService knowledgeRetrievalService;

    private RagEvaluationService service;

    @BeforeEach
    void setUp() {
        service = new RagEvaluationService(knowledgeRetrievalService, new ObjectMapper());
        ReflectionTestUtils.setField(service, "topK", 3);
    }

    @Test
    void shouldComputeEvaluationMetricsAcrossCases() {
        RagEvaluationCase clinicHours = new RagEvaluationCase(
                "case-1",
                "phong kham mo cua may gio",
                "CLINIC_HOURS",
                List.of("CLINIC_WORKING_HOURS")
        );
        RagEvaluationCase servicePrice = new RagEvaluationCase(
                "case-2",
                "gia kham tong quat bao nhieu",
                "SERVICE_PRICE",
                List.of("SERVICE_PRICE_BASIC")
        );

        when(knowledgeRetrievalService.retrieve("phong kham mo cua may gio", "CLINIC_HOURS"))
                .thenReturn(List.of(
                        new RetrievedKnowledge(
                                new KnowledgeDocument("CLINIC_WORKING_HOURS", "CLINIC_HOURS", "Hours", "Hours", List.of()),
                                0.91,
                                List.of("semantic")
                        ),
                        new RetrievedKnowledge(
                                new KnowledgeDocument("RAG_CAPABILITY_NOTE", "UNKNOWN", "RAG", "RAG", List.of()),
                                0.44,
                                List.of("rag")
                        )
                ));
        when(knowledgeRetrievalService.retrieve("gia kham tong quat bao nhieu", "SERVICE_PRICE"))
                .thenReturn(List.of(
                        new RetrievedKnowledge(
                                new KnowledgeDocument("OTHER_DOC", "SERVICE_PRICE", "Other", "Other", List.of()),
                                0.78,
                                List.of("gia")
                        ),
                        new RetrievedKnowledge(
                                new KnowledgeDocument("SERVICE_PRICE_BASIC", "SERVICE_PRICE", "Price", "Price", List.of()),
                                0.73,
                                List.of("chi phi")
                        )
                ));

        var report = service.evaluate(List.of(clinicHours, servicePrice));

        assertThat(report.summary().totalCases()).isEqualTo(2);
        assertThat(report.summary().topK()).isEqualTo(3);
        assertThat(report.summary().hitRateAtK()).isEqualTo(1.0);
        assertThat(report.summary().meanPrecisionAtK()).isEqualTo((1.0 / 3.0 + 1.0 / 3.0) / 2.0);
        assertThat(report.summary().meanRecallAtK()).isEqualTo(1.0);
        assertThat(report.summary().meanReciprocalRank()).isEqualTo((1.0 + 0.5) / 2.0);
        assertThat(report.cases()).hasSize(2);
        assertThat(report.cases().get(1).retrievedDocumentIds()).containsExactly("OTHER_DOC", "SERVICE_PRICE_BASIC");
    }
}
