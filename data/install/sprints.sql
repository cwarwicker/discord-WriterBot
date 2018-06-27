CREATE TABLE IF NOT EXISTS 'main'.'sprints' (
    id INTEGER PRIMARY KEY,
    guild INTEGER NOT NULL,
    end BIGINT NOT NULL,
    createdby TEXT NOT NULL,
    created BIGINT NOT NULL,
    completed BIGINT DEFAULT 0
);