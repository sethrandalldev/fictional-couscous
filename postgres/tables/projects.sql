BEGIN TRANSACTION;

CREATE TABLE projects (
  id serial PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT
);

COMMIT;