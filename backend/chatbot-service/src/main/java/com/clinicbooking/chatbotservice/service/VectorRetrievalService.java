package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import com.clinicbooking.chatbotservice.repository.KnowledgeChunkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VectorRetrievalService {

    private final KnowledgeChunkRepository knowledgeChunkRepository;
    private final EmbeddingService embeddingService;

    @Value("${ai.rag.top-k:3}")
    private int topK;

    @Value("${ai.rag.vector.min-score:0.2}")
    private double minScore;

    public List<RetrievedKnowledge> retrieve(String normalizedQuestion, String intentId) {
        if (normalizedQuestion == null || normalizedQuestion.isBlank()) {
            return List.of();
        }

        Optional<List<Double>> queryEmbedding = Optional.ofNullable(
                embeddingService.embed(normalizedQuestion, EmbeddingTask.RETRIEVAL_QUERY)
        ).flatMap(optional -> optional);
        if (queryEmbedding.isEmpty()) {
            return List.of();
        }

        return knowledgeChunkRepository.searchSimilar(
                toFloatArray(queryEmbedding.get()),
                intentId,
                topK,
                minScore
        );
    }

    private float[] toFloatArray(List<Double> values) {
        float[] result = new float[values.size()];
        for (int index = 0; index < values.size(); index++) {
            result[index] = values.get(index).floatValue();
        }
        return result;
    }
}
