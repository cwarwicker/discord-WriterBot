CREATE TABLE IF NOT EXISTS 'main'.'user_xp' (
    id INTEGER PRIMARY KEY,
    guild TEXT NOT NULL,
    user TEXT NOT NULL,
    xp INTEGER DEFAULT 0
);