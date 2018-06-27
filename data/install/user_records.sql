CREATE TABLE IF NOT EXISTS 'main'.'user_records' (
    id INTEGER PRIMARY KEY,
    guild TEXT NOT NULL,
    user TEXT NOT NULL,
    record TEXT NOT NULL,
    value REAL DEFAULT 0
);