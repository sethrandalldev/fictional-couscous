BEGIN TRANSACTION;

CREATE TABLE projects (
  id serial PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

COMMIT;