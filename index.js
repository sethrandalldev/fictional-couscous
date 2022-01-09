const express = require("express");
const bodyParser = require("body-parser");
const argon2 = require("argon2");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const database = {
  users: [
    {
      id: "123",
      name: "Seth",
      email: "seth@gmail.com",
      password: "cookies",
      created: new Date(),
    },
    {
      id: "124",
      name: "John",
      email: "john@gmail.com",
      password: "bananas",
      created: new Date(),
    },
  ],
};

app.get("/", (req, res) => {
  res.json(database.users);
});

app.post("/login", async (req, res) => {
  if (req.body.email === database.users[2].email) {
    try {
      if (await argon2.verify(database.users[2].password, req.body.password)) {
        res.json("success");
      } else {
        res.status(404).json("Login failed; Invalid user ID or password.");
      }
    } catch (err) {
      res.status(400).json("Login failed; server error.");
    }
  } else {
    res.status(400).json("error logging in");
  }
});

app.post("/register", async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const hash = await argon2.hash(password);
    database.users.push({
      id: "125",
      name,
      email,
      password: hash,
      created: new Date(),
    });
    res.json(database.users[database.users.length - 1]);
  } catch (err) {
    res.status(400).json("Error registering user.");
  }
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  let found = false;
  database.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      res.json(user);
    }
  });
  if (!found) {
    res.status(404).json("no such user");
  }
});

app.listen(4000, () => {
  console.log("App is running on port 4000");
});

/*
/ --> res = this is working
/login --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/projects/:projectId --> GET = project
/projects --> POST = project
/projects --> GET = projects
/workspaces/:workspaceId --> GET = workspace
/workspaces --> POST = workspace
/workspaces --> GET = workspaces
/tickets/:ticketId --> GET = ticket
/tickets --> POST = ticket
/tickets --> GET = tickets
/tickets/:ticketId/comments --> POST = comment
/tickets/:ticketId/comments --> GET = comments
/workspaces/:workspaceId/:userId --> POST = workspace_user
/workspaces/:workspacedId/:userId --> GET = workspace_user
/workspaces/:workspacedId/users --> GET = workspace_users
*/
