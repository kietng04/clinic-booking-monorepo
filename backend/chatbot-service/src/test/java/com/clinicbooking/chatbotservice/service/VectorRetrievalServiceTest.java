package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import com.clinicbooking.chatbotservice.repository.KnowledgeChunkRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VectorRetrievalServiceTest {

    @Mock
    private EmbeddingService embeddingService;

    @Mock
    private KnowledgeChunkRepository knowledgeChunkRepository;

    private VectorRetrievalService service;

    @BeforeEach
    void setUp() {
        service = new VectorRetrievalService(knowledgeChunkRepository, embeddingService);
        ReflectionTestUtils.setField(service, "topK", 3);
        ReflectionTestUtils.setField(service, "minScore", 0.2);
    }

    @Test
    void shouldRetrieveSemanticallyRelevantDocument() {
        RetrievedKnowledge result = new RetrievedKnowledge(
                new KnowledgeDocument(
                        "CLINIC_WORKING_HOURS",
                        "CLINIC_HOURS",
                        "Gio lam viec",
                        "Phong kham lam viec tu 07:30 den 20:00.",
                        List.of("gio lam viec")
                ),
                0.91,
                List.of()
        );

        when(embeddingService.embed("khi nao phong kham hoat dong", EmbeddingTask.RETRIEVAL_QUERY))
                .thenReturn(Optional.of(List.of(1.0, 0.0, 0.0)));
        when(knowledgeChunkRepository.searchSimilar(new float[] {1.0f, 0.0f, 0.0f}, "CLINIC_HOURS", 3, 0.2))
                .thenReturn(List.of(result));

        var results = service.retrieve("khi nao phong kham hoat dong", "CLINIC_HOURS");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).document().id()).isEqualTo("CLINIC_WORKING_HOURS");
        assertThat(results.get(0).score()).isGreaterThan(0.8);
    }

    @Test
    void shouldReturnEmptyWhenQueryEmbeddingUnavailable() {
        when(embeddingService.embed("hoi gi do", EmbeddingTask.RETRIEVAL_QUERY)).thenReturn(Optional.empty());

        var results = service.retrieve("hoi gi do", "UNKNOWN");

        assertThat(results).isEmpty();
    }
}
