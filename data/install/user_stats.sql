CREATE TABLE IF NOT EXISTS 'main'.'user_stats' (
    id INTEGER PRIMARY KEY,
    guild TEXT NOT NULL,
    user TEXT NOT NULL,
    name TEXT NOT NULL,
    value INTEGER DEFAULT 0
);