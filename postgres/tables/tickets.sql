BEGIN TRANSACTION;

CREATE TABLE tickets (
  id serial PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to INT,
  created_by INT NOT NULL,
  priority INT,
  status TEXT,
  project_id INT NOT NULL,
  CONSTRAINT fk_project
    FOREIGN KEY(project_id)
      REFERENCES projects(id)
        ON DELETE CASCADE
);

COMMIT;