const express = require("express");
const bodyParser = require("body-parser");
const argon2 = require("argon2");
const cors = require("cors");
const knex = require("knex");
const morgan = require("morgan");
const login = require("./controllers/login");
const register = require("./controllers/register");
const auth = require("./controllers/authorization");

let port = process.env.PORT || 4000;

const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  //process.env.POSTGRES_URI,
});

const app = express();

app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(cors());

app.post("/login", login.loginWithAuth(db, argon2));
app.post("/register", register.register(db, argon2));

app.get("/users/:id", auth.requireAuth, (req, res) => {
  const { id } = req.params;
  db.select(["id", "first_name", "last_name", "email", "joined"])
    .from("users")
    .where({ id: id })
    .then((users) => {
      if (users.length) {
        const user = users[0];
        res.json({
          email: user.email,
          firstName: user["first_name"],
          lastName: user["last_name"],
          id: user.id,
          joined: user.joined,
        });
      } else {
        res.status(400).json("Error getting user.");
      }
    })
    .catch((err) => res.status(400).json("Error getting user."));
});

app.patch("/users/:userId", auth.requireAuth, (req, res) => {
  const { userId } = req.params;
  const { email, firstName, lastName } = req.body;
  db("users")
    .where({ id: userId })
    .update({ email: email, first_name: firstName, last_name: lastName }, [
      "id",
      "first_name",
      "last_name",
      "email",
      "joined",
    ])
    .then((users) => {
      if (users.length) {
        const user = users[0];
        res.json({
          email: user.email,
          firstName: user["first_name"],
          lastName: user["last_name"],
          id: user.id,
          joined: user.joined,
        });
      } else {
        res.status(400).json("Error updating user.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json("Error updating user.");
    });
});

app.post("/projects", auth.requireAuth, (req, res) => {
  console.log(req);
  const { title, description } = req.body;
  const { userId } = req;

  db("projects")
    .returning(["id", "title", "description"])
    .insert({
      title: title,
      description: description,
    })
    .then((project) => {
      console.log(project);
      db("project_users")
        .returning(["id", "user_id", "project_id"])
        .insert({
          user_id: userId,
          project_id: project.id,
        })
        .then((projectUser) => {
          res.json({
            project: project,
            projectUser: {
              id: projectUser.id,
              userId: projectUser["user_id"],
              projectId: projectUser["projectId"],
            },
          });
        })
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => res.status(400).json("Unable to create project."));
});

app.get("/projects", auth.requireAuth, (req, res) => {
  db.select(["id", "title", "description"])
    .from("projects")
    .then((projects) => {
      res.status(200).json(projects);
    })
    .catch((err) => res.status(400).json(err));
});

app.get("/projects/:projectId/tickets", auth.requireAuth, (req, res) => {
  const { projectId } = req.params;
  db.select([
    "id",
    "title",
    "description",
    "created_by",
    "assigned_to",
    "priority",
    "status",
    "project_id",
  ])
    .from("tickets")
    .where({ project_id: projectId })
    .then((tickets) => {
      res.status(200).json(tickets);
    })
    .catch((err) => res.status(400).json("Error getting tickets."));
});

app.get(
  "/projects/:projectId/tickets/:ticketId/comments",
  auth.requireAuth,
  (req, res) => {
    const { projectId } = req.params;
    db.select([
      "id",
      "title",
      "description",
      "created_by",
      "assigned_to",
      "priority",
      "status",
      "project_id",
    ])
      .from("tickets")
      .where({ project_id: projectId })
      .then((tickets) => {
        res.status(200).json(tickets);
      })
      .catch((err) => res.status(400).json("Error getting tickets."));
  }
);

app.get("/projects/:projectId/project-users", auth.requireAuth, (req, res) => {
  const { projectId } = req.params;
  db.select(["id", "user_id", "is_admin", "project_id"])
    .from("project_users")
    .where({ project_id: projectId })
    .then((projectUsers) => {
      res.status(200).json(projectUsers);
    })
    .catch((err) => res.status(400).json("Error getting project users."));
});

// WHERE user.id === recipient.id OR WHERE user.id === sender.id
app.get("/project-invitations", auth.requireAuth, (req, res) => {
  const { projectId } = req.params;
  db.select(["id", "user_id", "is_admin", "project_id"])
    .from("project_users")
    .where({ project_id: projectId })
    .then((projectUsers) => {
      res.status(200).json(projectUsers);
    })
    .catch((err) => res.status(400).json("Error getting project users."));
});

app.listen(port, () => {
  console.log("App is running on port 4000");
});

/*
DONE /login --> POST = success/fail
DONE /register --> POST = user
DONE profile/:userId --> GET = user
/projects/:projectId --> GET = project
DONE /projects --> POST = project & project_user
DONE /projects --> GET = projects
/projects/:projectId/tickets/:ticketId --> GET = ticket
/projects/:projectId/tickets --> POST = ticket
/projects/:projectIdtickets --> GET = tickets
/projects/:projectId/tickets/:ticketId/comments --> POST = comment
/projects/:projectId/tickets/:ticketId/comments --> GET = comments
/projects/:projectId/project-users/:userId --> POST = project_user
/projects/:projectId/project-users/:userId --> GET =project_user
/projects/:projectId/project-users --> GET = project_users
/project-invitations
*/
