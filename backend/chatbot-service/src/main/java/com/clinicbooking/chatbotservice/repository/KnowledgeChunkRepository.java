package com.clinicbooking.chatbotservice.repository;

import com.clinicbooking.chatbotservice.model.KnowledgeChunkRow;
import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import com.pgvector.PGvector;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Repository
@RequiredArgsConstructor
@Slf4j
public class KnowledgeChunkRepository {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    @PostConstruct
    void registerVectorTypes() {
        try (Connection connection = dataSource.getConnection()) {
            PGvector.registerTypes(connection);
            log.info("Registered pgvector JDBC types for chatbot-service");
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to register pgvector JDBC types", ex);
        }
    }

    public void replaceKnowledgeBase(List<KnowledgeChunkRow> rows, List<float[]> embeddings) {
        replaceKnowledgeSource("KNOWLEDGE_BASE", rows, embeddings);
    }

    public void replaceKnowledgeSource(String sourceType, List<KnowledgeChunkRow> rows, List<float[]> embeddings) {
        jdbcTemplate.update("DELETE FROM knowledge_chunks WHERE source_type = ?", sourceType);

        if (rows == null || rows.isEmpty()) {
            return;
        }

        jdbcTemplate.batchUpdate(
                """
                INSERT INTO knowledge_chunks (
                    knowledge_id,
                    intent_id,
                    title,
                    content,
                    keywords,
                    source_type,
                    embedding
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                rows,
                rows.size(),
                (preparedStatement, row) -> {
                    int rowIndex = rows.indexOf(row);
                    preparedStatement.setString(1, row.knowledgeId());
                    preparedStatement.setString(2, normalizeIntent(row.intentId()));
                    preparedStatement.setString(3, row.title());
                    preparedStatement.setString(4, row.content());
                    preparedStatement.setArray(
                            5,
                            preparedStatement.getConnection().createArrayOf(
                                    "text",
                                    row.keywords() == null ? new String[0] : row.keywords().toArray(String[]::new)
                            )
                    );
                    preparedStatement.setString(6, row.sourceType() == null ? sourceType : row.sourceType());
                    preparedStatement.setObject(7, new PGvector(embeddings.get(rowIndex)));
                }
        );
    }

    public List<RetrievedKnowledge> searchSimilar(float[] queryEmbedding, String intentId, int topK, double minScore) {
        if (queryEmbedding == null || queryEmbedding.length == 0) {
            return List.of();
        }

        String normalizedIntent = normalizeIntent(intentId);
        return jdbcTemplate.query(
                """
                SELECT knowledge_id,
                       intent_id,
                       title,
                       content,
                       keywords,
                       1 - (embedding <=> ?) AS similarity_score
                FROM knowledge_chunks
                WHERE (
                        (? = 'UNKNOWN' AND intent_id = 'UNKNOWN')
                     OR (? <> 'UNKNOWN' AND (intent_id = ? OR intent_id = 'UNKNOWN'))
                )
                  AND 1 - (embedding <=> ?) >= ?
                ORDER BY embedding <=> ?
                LIMIT ?
                """,
                preparedStatement -> {
                    PGvector vector = new PGvector(queryEmbedding);
                    preparedStatement.setObject(1, vector);
                    preparedStatement.setString(2, normalizedIntent);
                    preparedStatement.setString(3, normalizedIntent);
                    preparedStatement.setString(4, normalizedIntent);
                    preparedStatement.setObject(5, vector);
                    preparedStatement.setDouble(6, minScore);
                    preparedStatement.setObject(7, vector);
                    preparedStatement.setInt(8, Math.max(topK, 1));
                },
                (resultSet, rowNum) -> {
                    List<String> keywords = new ArrayList<>();
                    java.sql.Array sqlArray = resultSet.getArray("keywords");
                    if (sqlArray != null && sqlArray.getArray() instanceof String[] values) {
                        for (String value : values) {
                            if (value != null && !value.isBlank()) {
                                keywords.add(value);
                            }
                        }
                    }

                    return new RetrievedKnowledge(
                            new KnowledgeDocument(
                                    resultSet.getString("knowledge_id"),
                                    resultSet.getString("intent_id"),
                                    resultSet.getString("title"),
                                    resultSet.getString("content"),
                                    List.copyOf(keywords)
                            ),
                            resultSet.getDouble("similarity_score"),
                            List.of()
                    );
                }
        );
    }

    public long countKnowledgeChunks() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM knowledge_chunks", Long.class);
        return count == null ? 0L : count;
    }

    private String normalizeIntent(String intentId) {
        if (intentId == null || intentId.isBlank()) {
            return "UNKNOWN";
        }
        return intentId.trim().toUpperCase(Locale.ROOT);
    }
}
