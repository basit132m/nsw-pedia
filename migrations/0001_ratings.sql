-- Visitor ratings, one row per voter per ROM.
--
-- `voter` is a salted SHA-256 of the IP and user agent, never the IP itself,
-- so the table holds no personal data and still blocks casual repeat voting.
-- The unique index makes a second vote an update rather than a duplicate, so
-- a visitor can change their mind without inflating the count.

CREATE TABLE IF NOT EXISTS ratings (
  slug       TEXT    NOT NULL,
  voter      TEXT    NOT NULL,
  score      INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (slug, voter)
);

CREATE INDEX IF NOT EXISTS ratings_by_slug ON ratings (slug);
