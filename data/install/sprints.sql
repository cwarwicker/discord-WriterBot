CREATE TABLE IF NOT EXISTS 'main'.'sprints' (
    id INTEGER PRIMARY KEY,
    guild TEXT NOT NULL,
    start BIGINT NOT NULL,
    end BIGINT NOT NULL,
    end_reference BIGINT NOT NULL,
    length BIGINT NOT NULL,
    createdby TEXT NOT NULL,
    created BIGINT NOT NULL,
    completed BIGINT DEFAULT 0
);