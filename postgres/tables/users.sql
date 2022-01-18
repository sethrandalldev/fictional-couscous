BEGIN TRANSACTION;

CREATE TABLE users (
  id serial PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  joined TIMESTAMP NOT NULL
);

COMMIT;