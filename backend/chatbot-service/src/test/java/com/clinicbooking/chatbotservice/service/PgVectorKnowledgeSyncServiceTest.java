package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.KnowledgeChunkRow;
import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import com.clinicbooking.chatbotservice.repository.KnowledgeChunkRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PgVectorKnowledgeSyncServiceTest {

    @Mock
    private KnowledgeBaseService knowledgeBaseService;

    @Mock
    private KnowledgeChunkRepository knowledgeChunkRepository;

    @Mock
    private EmbeddingService embeddingService;

    private PgVectorKnowledgeSyncService service;

    @BeforeEach
    void setUp() {
        service = new PgVectorKnowledgeSyncService(
                knowledgeBaseService,
                knowledgeChunkRepository,
                embeddingService
        );
        ReflectionTestUtils.setField(service, "pgvectorEnabled", true);
        ReflectionTestUtils.setField(service, "autoSyncEnabled", true);
    }

    @Test
    void shouldSyncKnowledgeDocumentsIntoPgvectorStore() throws Exception {
        KnowledgeDocument document = new KnowledgeDocument(
                "BOOKING_GUIDE",
                "BOOK_APPOINTMENT",
                "Huong dan dat lich",
                "Chon bac si va khung gio.",
                List.of("dat lich")
        );

        when(knowledgeBaseService.getDocuments()).thenReturn(List.of(document));
        when(embeddingService.embed("Huong dan dat lich Chon bac si va khung gio.", EmbeddingTask.RETRIEVAL_DOCUMENT))
                .thenReturn(Optional.of(List.of(1.0, 2.0, 3.0)));

        service.run(new DefaultApplicationArguments(new String[0]));

        ArgumentCaptor<List<KnowledgeChunkRow>> rowsCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<List<float[]>> embeddingsCaptor = ArgumentCaptor.forClass(List.class);
        verify(knowledgeChunkRepository).replaceKnowledgeBase(rowsCaptor.capture(), embeddingsCaptor.capture());

        assertThat(rowsCaptor.getValue()).hasSize(1);
        assertThat(rowsCaptor.getValue().get(0).knowledgeId()).isEqualTo("BOOKING_GUIDE");
        assertThat(embeddingsCaptor.getValue()).hasSize(1);
        assertThat(embeddingsCaptor.getValue().get(0)).containsExactly(1.0f, 2.0f, 3.0f);
    }
}
