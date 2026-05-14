package com.clinicbooking.chatbotservice.repository;

import com.clinicbooking.chatbotservice.model.KnowledgeChunkRow;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
class KnowledgeChunkRepositoryIntegrationTest {

    private static final int EMBEDDING_DIMENSIONS = 3072;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> postgresJdbcUrl());
        registry.add("spring.datasource.username", () -> postgresUsername());
        registry.add("spring.datasource.password", () -> postgresPassword());
        registry.add("spring.flyway.url", () -> postgresJdbcUrl());
        registry.add("spring.flyway.user", () -> postgresUsername());
        registry.add("spring.flyway.password", () -> postgresPassword());
        registry.add("spring.data.redis.host", () -> "localhost");
        registry.add("spring.data.redis.port", () -> "6379");
        registry.add("jwt.secret", () -> "dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yand0dG9rZW5nZW5lcmF0aW9uYW5kdmFsaWRhdGlvbjEyMzQ1Njc4OTA=");
    }

    private static String postgresJdbcUrl() {
        return System.getProperty(
                "test.pgvector.jdbc-url",
                "jdbc:postgresql://localhost:5438/chatbot_service_db"
        );
    }

    private static String postgresUsername() {
        return System.getProperty("test.pgvector.username", "postgres");
    }

    private static String postgresPassword() {
        return System.getProperty("test.pgvector.password", "postgres");
    }

    @Autowired
    private KnowledgeChunkRepository repository;

    @BeforeEach
    void setUp() {
        repository.replaceKnowledgeSource("KNOWLEDGE_BASE", List.of(), List.of());
        repository.replaceKnowledgeSource("CLINIC_DIRECTORY", List.of(), List.of());
    }

    @Test
    void shouldSearchSimilarVectorsInPgvector() {
        repository.replaceKnowledgeSource(
                "KNOWLEDGE_BASE",
                List.of(
                        new KnowledgeChunkRow("DOC_1", "CLINIC_HOURS", "Gio lam viec", "Phong kham mo cua 07:30", List.of("gio"), "KNOWLEDGE_BASE"),
                        new KnowledgeChunkRow("DOC_2", "SERVICE_PRICE", "Bang gia", "Kham tong quat 200000", List.of("gia"), "KNOWLEDGE_BASE")
                ),
                List.of(
                        embedding(0),
                        embedding(1)
                )
        );

        var results = repository.searchSimilar(queryEmbedding(0, 1), "CLINIC_HOURS", 3, 0.1);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).document().id()).isEqualTo("DOC_1");
        assertThat(results.get(0).score()).isGreaterThan(0.9);
    }

    private static float[] embedding(int index) {
        float[] values = new float[EMBEDDING_DIMENSIONS];
        values[index] = 1.0f;
        return values;
    }

    private static float[] queryEmbedding(int primaryIndex, int secondaryIndex) {
        float[] values = new float[EMBEDDING_DIMENSIONS];
        values[primaryIndex] = 0.95f;
        values[secondaryIndex] = 0.05f;
        return values;
    }
}
