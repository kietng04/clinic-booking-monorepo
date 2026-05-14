package com.clinicbooking.chatbotservice.repository;

import com.clinicbooking.chatbotservice.model.KnowledgeChunkRow;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class KnowledgeChunkRepositoryIntegrationTest {

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
