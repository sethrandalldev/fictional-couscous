BEGIN TRANSACTION;

CREATE TABLE project_invitations(
  id serial PRIMARY KEY,
  sender_id INT,
  recipient_id INT,
  project_id INT NOT NULL,
  is_admin BOOLEAN,
  CONSTRAINT fk_project
    FOREIGN KEY(project_id)
      REFERENCES projects(id)
        ON DELETE CASCADE,
  CONSTRAINT fk_sender
    FOREIGN KEY(sender_id)
      REFERENCES users(id)
        ON DELETE SET NULL,
  CONSTRAINT fk_recipient
    FOREIGN KEY(recipient_id)
      REFERENCES users(id)
        ON DELETE SET NULL
);

COMMIT;