package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.ChatbotServiceApplication;
import com.clinicbooking.chatbotservice.dto.ClassifyQuestionResponse;
import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import com.clinicbooking.chatbotservice.repository.KnowledgeChunkRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest(classes = ChatbotServiceApplication.class, webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class HybridRagPipelineIntegrationTest {

    private static final int EMBEDDING_DIMENSIONS = 3072;

    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg16")
            .withDatabaseName("chatbot_service_db")
            .withUsername("postgres")
            .withPassword("postgres");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.url", postgres::getJdbcUrl);
        registry.add("spring.flyway.user", postgres::getUsername);
        registry.add("spring.flyway.password", postgres::getPassword);
        registry.add("spring.data.redis.host", () -> "localhost");
        registry.add("spring.data.redis.port", () -> "6379");
        registry.add("jwt.secret", () -> "dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yand0dG9rZW5nZW5lcmF0aW9uYW5kdmFsaWRhdGlvbjEyMzQ1Njc4OTA=");
    }

    @Autowired
    private PgVectorKnowledgeSyncService pgVectorKnowledgeSyncService;

    @Autowired
    private KnowledgeRetrievalService knowledgeRetrievalService;

    @Autowired
    private ChatOrchestratorService chatOrchestratorService;

    @Autowired
    private KnowledgeChunkRepository knowledgeChunkRepository;

    @MockBean
    private KnowledgeBaseService knowledgeBaseService;

    @MockBean
    private EmbeddingService embeddingService;

    @MockBean
    private QuestionClassifierService questionClassifierService;

    @MockBean
    private GeminiAnswerService geminiAnswerService;

    @MockBean
    private DoctorDirectoryService doctorDirectoryService;

    @MockBean
    private ClinicDirectoryService clinicDirectoryService;

    @MockBean
    private ServiceCatalogService serviceCatalogService;

    @BeforeEach
    void setUp() {
        knowledgeChunkRepository.replaceKnowledgeSource("KNOWLEDGE_BASE", List.of(), List.of());
        knowledgeChunkRepository.replaceKnowledgeSource("CLINIC_DIRECTORY", List.of(), List.of());
        ReflectionTestUtils.setField(pgVectorKnowledgeSyncService, "autoSyncEnabled", true);
    }

    @Test
    void shouldRetrieveAndAnswerUsingPgvectorAndLexicalPipeline() throws Exception {
        KnowledgeDocument document = new KnowledgeDocument(
                "CLINIC_WORKING_HOURS",
                "CLINIC_HOURS",
                "Gio lam viec phong kham",
                "Phong kham lam viec tu 07:30 den 20:00.",
                List.of("gio mo cua", "gio lam viec")
        );

        when(knowledgeBaseService.getDocuments()).thenReturn(List.of(document));
        when(embeddingService.embed("Gio lam viec phong kham Phong kham lam viec tu 07:30 den 20:00.", EmbeddingTask.RETRIEVAL_DOCUMENT))
                .thenReturn(Optional.of(toEmbeddingList(embedding(0))));
        when(embeddingService.embed("phong kham mo cua may gio", EmbeddingTask.RETRIEVAL_QUERY))
                .thenReturn(Optional.of(toEmbeddingList(embedding(0))));

        pgVectorKnowledgeSyncService.run(null);

        var retrieved = knowledgeRetrievalService.retrieve("phong kham mo cua may gio", "CLINIC_HOURS");

        assertThat(retrieved).isNotEmpty();
        assertThat(retrieved.get(0).document().id()).isEqualTo("CLINIC_WORKING_HOURS");

        when(questionClassifierService.classify("phong kham mo cua may gio", "PATIENT"))
                .thenReturn(new ClassifyQuestionResponse(
                        "phong kham mo cua may gio",
                        "phong kham mo cua may gio",
                        "CLINIC_HOURS",
                        "Gio mo cua phong kham",
                        0.9,
                        "RULE_BASED",
                        false,
                        "rule"
                ));
        when(geminiAnswerService.generateAnswer(any(), any(), any(), any()))
                .thenReturn(Optional.of("Phong kham lam viec tu 07:30 den 20:00."));

        var response = chatOrchestratorService.chat("phong kham mo cua may gio", "PATIENT", "Bearer token");

        assertThat(response.ragUsed()).isTrue();
        assertThat(response.answerProvider()).isEqualTo("GEMINI_RAG");
        assertThat(response.sources()).isNotEmpty();
    }

    private static float[] embedding(int index) {
        float[] values = new float[EMBEDDING_DIMENSIONS];
        values[index] = 1.0f;
        return values;
    }

    private static List<Double> toEmbeddingList(float[] values) {
        java.util.ArrayList<Double> embedding = new java.util.ArrayList<>(values.length);
        for (float value : values) {
            embedding.add((double) value);
        }
        return List.copyOf(embedding);
    }
}
