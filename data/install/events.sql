CREATE TABLE IF NOT EXISTS 'main'.'events' (
    id INTEGER PRIMARY KEY,
    guild TEXT NOT NULL,
    channel TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    startdate BIGINT NULL,
    enddate BIGINT NULL,
    started INTEGER NOT NULL DEFAULT 0,
    ended INTEGER NOT NULL DEFAULT 0
);