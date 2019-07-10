CREATE TABLE IF NOT EXISTS 'main'.'user_goals' (
    [id] INTEGER PRIMARY KEY,
    [guild] TEXT NOT NULL,
    [user] TEXT NOT NULL,
    [type] TEXT NOT NULL,
    [goal] INTEGER NOT NULL,
    [current] INTEGER NOT NULL,
    [completed] BOOLEAN NOT NULL,
    [reset] BIGINT NOT NULL,
    [lastreset] BIGINT NOT NULL    
);