package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KnowledgeRetrievalServiceTest {

    @Mock
    private QueryExpansionService queryExpansionService;

    @Mock
    private LexicalRetrievalService lexicalRetrievalService;

    @Mock
    private VectorRetrievalService vectorRetrievalService;

    @Mock
    private RerankingService rerankingService;

    private KnowledgeRetrievalService service;

    @BeforeEach
    void setUp() {
        service = new KnowledgeRetrievalService(
                queryExpansionService,
                lexicalRetrievalService,
                vectorRetrievalService,
                rerankingService
        );
        org.springframework.test.util.ReflectionTestUtils.setField(service, "rerankCandidateLimit", 8);
    }

    @Test
    void shouldUseHybridRetrievalAndReranking() {
        RetrievedKnowledge lexical = new RetrievedKnowledge(
                new KnowledgeDocument("LEXICAL_1", "CLINIC_HOURS", "Lexical", "Lexical match", List.of("gio mo cua")),
                0.55,
                List.of("gio mo cua")
        );
        RetrievedKnowledge semantic = new RetrievedKnowledge(
                new KnowledgeDocument("VECTOR_1", "CLINIC_HOURS", "Vector", "Semantic match", List.of()),
                0.74,
                List.of()
        );
        RetrievedKnowledge reranked = new RetrievedKnowledge(
                semantic.document(),
                0.92,
                List.of("semantic")
        );

        when(queryExpansionService.expand("phong kham lam viec luc nao", "CLINIC_HOURS"))
                .thenReturn(List.of("phong kham lam viec luc nao"));
        when(lexicalRetrievalService.retrieve("phong kham lam viec luc nao", "CLINIC_HOURS"))
                .thenReturn(List.of(lexical));
        when(vectorRetrievalService.retrieve("phong kham lam viec luc nao", "CLINIC_HOURS"))
                .thenReturn(List.of(semantic));
        when(rerankingService.rerank(
                "phong kham lam viec luc nao",
                "CLINIC_HOURS",
                List.of(lexical),
                List.of(semantic)
        )).thenReturn(List.of(reranked));

        var results = service.retrieve("phong kham lam viec luc nao", "CLINIC_HOURS");

        assertThat(results).containsExactly(reranked);
    }

    @Test
    void shouldReturnLexicalResultsWhenVectorUnavailable() {
        RetrievedKnowledge lexical = new RetrievedKnowledge(
                new KnowledgeDocument("LEXICAL_1", "SERVICE_PRICE", "Gia", "Gia dich vu", List.of("gia")),
                0.67,
                List.of("gia")
        );

        when(queryExpansionService.expand("gia kham bao nhieu", "SERVICE_PRICE"))
                .thenReturn(List.of("gia kham bao nhieu"));
        when(lexicalRetrievalService.retrieve("gia kham bao nhieu", "SERVICE_PRICE"))
                .thenReturn(List.of(lexical));
        when(vectorRetrievalService.retrieve("gia kham bao nhieu", "SERVICE_PRICE"))
                .thenReturn(List.of());
        when(rerankingService.rerank("gia kham bao nhieu", "SERVICE_PRICE", List.of(lexical), List.of()))
                .thenReturn(List.of(lexical));

        var results = service.retrieve("gia kham bao nhieu", "SERVICE_PRICE");

        assertThat(results).containsExactly(lexical);
    }

    @Test
    void shouldMergeCandidatesAcrossExpandedQueries() {
        RetrievedKnowledge lexicalA = new RetrievedKnowledge(
                new KnowledgeDocument("DOC_A", "CLINIC_HOURS", "A", "A", List.of("gio mo cua")),
                0.40,
                List.of("gio mo cua")
        );
        RetrievedKnowledge lexicalB = new RetrievedKnowledge(
                new KnowledgeDocument("DOC_A", "CLINIC_HOURS", "A", "A", List.of("gio lam viec")),
                0.62,
                List.of("gio lam viec")
        );
        RetrievedKnowledge reranked = new RetrievedKnowledge(
                lexicalA.document(),
                0.88,
                List.of("gio mo cua", "gio lam viec")
        );

        when(queryExpansionService.expand("phong kham mo cua may gio", "CLINIC_HOURS"))
                .thenReturn(List.of("phong kham mo cua may gio", "gio lam viec phong kham"));
        when(lexicalRetrievalService.retrieve("phong kham mo cua may gio", "CLINIC_HOURS"))
                .thenReturn(List.of(lexicalA));
        when(lexicalRetrievalService.retrieve("gio lam viec phong kham", "CLINIC_HOURS"))
                .thenReturn(List.of(lexicalB));
        when(vectorRetrievalService.retrieve("phong kham mo cua may gio", "CLINIC_HOURS"))
                .thenReturn(List.of());
        when(vectorRetrievalService.retrieve("gio lam viec phong kham", "CLINIC_HOURS"))
                .thenReturn(List.of());
        when(rerankingService.rerank(
                "phong kham mo cua may gio",
                "CLINIC_HOURS",
                List.of(new RetrievedKnowledge(lexicalA.document(), 0.62, List.of("gio mo cua", "gio lam viec"))),
                List.of()
        )).thenReturn(List.of(reranked));

        var results = service.retrieve("phong kham mo cua may gio", "CLINIC_HOURS");

        assertThat(results).containsExactly(reranked);
    }
}
