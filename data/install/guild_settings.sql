CREATE TABLE IF NOT EXISTS 'main'.'guild_settings' (
    id INTEGER PRIMARY KEY,
    guild TEXT NOT NULL,
    setting TEXT NOT NULL,
    value TEXT NOT NULL
);