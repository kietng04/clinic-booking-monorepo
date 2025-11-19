package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeBaseService {

    private final ObjectMapper objectMapper;

    @Value("${ai.rag.knowledge-path:knowledge/default-knowledge-base.json}")
    private String knowledgePath;

    private volatile List<KnowledgeDocument> documents = List.of();

    @PostConstruct
    void initialize() {
        documents = loadKnowledgeDocuments();
        log.info("Loaded {} knowledge documents from {}", documents.size(), knowledgePath);
    }

    public List<KnowledgeDocument> getDocuments() {
        return documents;
    }

    private List<KnowledgeDocument> loadKnowledgeDocuments() {
        try {
            ClassPathResource resource = new ClassPathResource(knowledgePath);
            if (!resource.exists()) {
                log.warn("Knowledge base file {} does not exist", knowledgePath);
                return List.of();
            }

            try (InputStream inputStream = resource.getInputStream()) {
                List<KnowledgeDocument> parsed = objectMapper.readValue(
                        inputStream,
                        new TypeReference<List<KnowledgeDocument>>() {
                        }
                );
                return sanitize(parsed);
            }
        } catch (Exception ex) {
            log.error("Failed to load knowledge base from {}", knowledgePath, ex);
            return List.of();
        }
    }

    private List<KnowledgeDocument> sanitize(List<KnowledgeDocument> raw) {
        if (raw == null || raw.isEmpty()) {
            return List.of();
        }

        List<KnowledgeDocument> cleaned = new ArrayList<>();
        for (KnowledgeDocument doc : raw) {
            if (doc == null || doc.id() == null || doc.id().isBlank()) {
                continue;
            }

            List<String> keywords = doc.keywords() == null ? List.of() : doc.keywords().stream()
                    .filter(k -> k != null && !k.isBlank())
                    .toList();

            cleaned.add(new KnowledgeDocument(
                    doc.id().trim(),
                    doc.intentId() == null ? "UNKNOWN" : doc.intentId().trim(),
                    doc.title() == null ? "" : doc.title().trim(),
                    doc.content() == null ? "" : doc.content().trim(),
                    keywords
            ));
        }

        return List.copyOf(cleaned);
    }
}
