const express = require("express");
const bodyParser = require("body-parser");
const argon2 = require("argon2");
const cors = require("cors");
const knex = require("knex");
const morgan = require("morgan");

const db = knex({
  client: "pg",
  connection: process.env.POSTGRES_URI,
});

const app = express();

app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(cors());

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  db.select()
    .table("users")
    .where({
      email: email,
    })
    .then(async (users) => {
      const user = users[0];
      console.log(users);
      try {
        if (await argon2.verify(user.password, password)) {
          res.json({
            email: user.email,
            firstName: user["first_name"],
            lastName: user["last_name"],
            id: user.id,
            joined: user.joined,
          });
        } else {
          res.status(404).json("Login failed; Invalid user ID or password.");
        }
      } catch (err) {
        console.log(err);
        res.status(400).json("Login failed; Server error.");
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json("Login failed; Server error.");
    });
});

app.post("/register", async (req, res) => {
  const { email, firstName, lastName, password } = req.body;
  try {
    const hash = await argon2.hash(password);
    db("users")
      .returning(["id", "first_name", "last_name", "email", "joined"])
      .insert({
        email: email,
        first_name: firstName,
        last_name: lastName,
        password: hash,
        joined: new Date(),
      })
      .then((user) => {
        res.json({
          email: user.email,
          firstName: user["first_name"],
          lastName: user["last_name"],
          id: user.id,
          joined: user.joined,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json("Unable to register.");
      });
  } catch (err) {
    console.log(err);
    res.status(400).json("Unable to register.");
  }
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select(["id", "first_name", "last_name", "email", "joined"])
    .from("users")
    .where({ id: id })
    .then((user) => {
      if (user.length) res.json(user[0]);
      else {
        res.status(400).json("Error getting user.");
      }
    })
    .catch((err) => res.status(400).json("Error getting user."));
});

app.post("/projects", (req, res) => {
  const { name, description, userId } = req.body;
  db("projects")
    .returning(["id", "title", "description"])
    .insert({
      name: name,
      description: description,
    })
    .then((project) => {
      db("project_users")
        .returning(["id", "user_id", "project_id", "is_admin"])
        .insert({
          user_id: userId,
          project_id: project.id,
          is_admin: true,
        })
        .then((projectUser) => {
          res.json({
            project: project,
            projectUser: {
              id: projectUser.id,
              userId: projectUser["user_id"],
              projectId: projectUser["projectId"],
              isAdmin: projectUser.isAdmin,
            },
          });
        })
        .catch((err) => res.status(400).json("Unable to create project user."));
    })
    .catch((err) => res.status(400).json("Unable to create project."));
});

app.listen(4000, () => {
  console.log("App is running on port 4000");
});

/*
DONE /login --> POST = success/fail
DONE /register --> POST = user
DONE profile/:userId --> GET = user
/projects/:projectId --> GET = project
/projects --> POST = project
/projects --> GET = projects
/projects/:projectId/tickets/:ticketId --> GET = ticket
/projects/:projectId/tickets --> POST = ticket
/projects/:projectIdtickets --> GET = tickets
/projects/:projectId/tickets/:ticketId/comments --> POST = comment
/projects/:projectId/tickets/:ticketId/comments --> GET = comments
/projects/:projectId/users/:userId --> POST = workspace_user
/projects/:projectId/users/:userId --> GET = workspace_user
/projects/:projectId/users --> GET = workspace_users
*/
