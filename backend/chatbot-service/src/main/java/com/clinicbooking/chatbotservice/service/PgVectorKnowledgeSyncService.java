package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.KnowledgeChunkRow;
import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import com.clinicbooking.chatbotservice.repository.KnowledgeChunkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PgVectorKnowledgeSyncService implements ApplicationRunner {

    private final KnowledgeBaseService knowledgeBaseService;
    private final KnowledgeChunkRepository knowledgeChunkRepository;
    private final EmbeddingService embeddingService;

    @Value("${ai.rag.pgvector.enabled:true}")
    private boolean pgvectorEnabled;

    @Value("${ai.rag.pgvector.auto-sync:true}")
    private boolean autoSyncEnabled;

    @Override
    public void run(ApplicationArguments args) {
        if (!pgvectorEnabled || !autoSyncEnabled) {
            log.info("Skip pgvector knowledge sync (enabled={}, autoSync={})", pgvectorEnabled, autoSyncEnabled);
            return;
        }

        List<KnowledgeDocument> documents = knowledgeBaseService.getDocuments();
        if (documents.isEmpty()) {
            log.info("No knowledge documents found for pgvector sync");
            return;
        }

        List<KnowledgeChunkRow> rows = new ArrayList<>();
        List<float[]> embeddings = new ArrayList<>();

        for (KnowledgeDocument document : documents) {
            embeddingService.embed(buildEmbeddingText(document), EmbeddingTask.RETRIEVAL_DOCUMENT)
                    .map(this::toFloatArray)
                    .ifPresent(embedding -> {
                        rows.add(new KnowledgeChunkRow(
                                document.id(),
                                document.intentId(),
                                document.title(),
                                document.content(),
                                document.keywords(),
                                "KNOWLEDGE_BASE"
                        ));
                        embeddings.add(embedding);
                    });
        }

        if (rows.isEmpty()) {
            log.warn("No embeddings generated for pgvector sync");
            return;
        }

        knowledgeChunkRepository.replaceKnowledgeBase(rows, embeddings);
        log.info("Synced {} knowledge chunks to pgvector store", rows.size());
    }

    private String buildEmbeddingText(KnowledgeDocument document) {
        return ((document.title() == null ? "" : document.title().trim()) + " "
                + (document.content() == null ? "" : document.content().trim())).trim();
    }

    private float[] toFloatArray(List<Double> values) {
        float[] result = new float[values.size()];
        for (int index = 0; index < values.size(); index++) {
            result[index] = values.get(index).floatValue();
        }
        return result;
    }
}
