BEGIN TRANSACTION;

CREATE TABLE ticket_comments (
  id serial PRIMARY KEY,
  user_id INT,
  ticket_id INT NOT NULL,
  text TEXT,
  CONSTRAINT fk_ticket
    FOREIGN KEY(ticket_id)
      REFERENCES tickets(id)
        ON DELETE CASCADE
);

COMMIT;