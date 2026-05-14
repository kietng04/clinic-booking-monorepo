CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id BIGSERIAL PRIMARY KEY,
    knowledge_id VARCHAR(100) NOT NULL UNIQUE,
    intent_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT[] NOT NULL DEFAULT '{}',
    source_type VARCHAR(50) NOT NULL DEFAULT 'KNOWLEDGE_BASE',
    embedding VECTOR(3072) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_intent_id ON knowledge_chunks(intent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source_type ON knowledge_chunks(source_type);

CREATE OR REPLACE FUNCTION update_knowledge_chunks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_knowledge_chunks_updated_at ON knowledge_chunks;
CREATE TRIGGER trg_knowledge_chunks_updated_at
    BEFORE UPDATE ON knowledge_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_knowledge_chunks_updated_at();
