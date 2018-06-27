CREATE TABLE IF NOT EXISTS 'main'.'sprint_users' (
    id INTEGER PRIMARY KEY,
    sprint INTEGER NOT NULL,
    user TEXT NOT NULL,
    s_wc INTEGER DEFAULT 0,
    e_wc INTEGER DEFAULT 0
);