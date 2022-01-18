BEGIN TRANSACTION;

CREATE TABLE project_users (
  id serial PRIMARY KEY,
  user_id INT,
  project_id INT NOT NULL,
  is_admin BOOLEAN,
  CONSTRAINT fk_project
    FOREIGN KEY(project_id)
      REFERENCES projects(id)
        ON DELETE CASCADE,
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
      REFERENCES users(id)
        ON DELETE SET NULL
);

COMMIT;