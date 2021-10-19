const express = require("express");
const app = express();
const PORT = 8000;
const { Client } = require("pg");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./project-tracker-9ec23-firebase-adminsdk-16f4u-9a747d97af.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "",
  port: 5432,
});

client.connect();

app.use(express.json());
app.use(cors());

app.get("/:userId/workspaces", (req, res) => {
  const query = "SELECT * FROM workspaces WHERE created_by = $1";
  const values = [req.params.userId];
  client.query(query, values, (err, data) => {
    if (err) {
      console.error(err.stack);
      return res.sendStatus(400);
    } else {
      const workspaces = data.rows;
      return res.status(200).send(workspaces);
    }
  });
});

app.post("/workspaces", (req, res) => {
  const query =
    "INSERT INTO workspaces(title, description, created_by) VALUES($1, $2, $3) RETURNING *";
  const values = [req.body.title, req.body.description, req.body.userId];

  client.query(query, values, (err, data) => {
    if (err) {
      console.error(err.stack);
      return res.sendStatus(400);
    } else {
      const workspace = data.rows[0];
      return res.status(200).send(workspace);
    }
  });
});

app.get("/workspaces/:id", (req, res) => {
  const query = "SELECT * FROM workspaces WHERE id = $1";
  const values = [req.params.id];

  client.query(query, values, (err, data) => {
    if (err) {
      console.error(err.stack);
      return res.sendStatus(400);
    } else {
      const workspace = data.rows[0];
      return res.status(200).send(workspace);
    }
  });
});

app.patch("/workspaces/:id", (req, res) => {
  const query =
    "UPDATE workspaces SET title = $1, description = $2 WHERE id = $3 RETURNING *";
  const values = [req.body.title, req.body.description, req.params.id];

  client.query(query, values, (err, data) => {
    if (err) {
      console.error(err.stack);
      return res.sendStatus(400);
    } else {
      const workspace = data.rows[0];
      return res.status(200).send(workspace);
    }
  });
});

app.delete("/workspaces/:id", (req, res) => {
  const query = "DELETE FROM workspaces WHERE id = $1";
  const values = [req.params.id];

  client.query(query, values, (err, data) => {
    if (err) {
      console.error(err.stack);
      return res.sendStatus(400);
    } else {
      return res.sendStatus(200);
    }
  });
});

app.listen(PORT, () => console.log(`Listening on localhost:${PORT}`));
