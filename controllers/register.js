const { createSession } = require("./redis");

const register = (db, argon2) => async (req, res) => {
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
      .then((user) => createSession(user))
      .then((session) => res.json(session))
      .catch((err) => {
        console.error(err);
        res.status(400).json("Unable to register.");
      });
  } catch (err) {
    console.error(err);
    res.status(400).json("Unable to register.");
  }
};

module.exports = {
  register,
};
