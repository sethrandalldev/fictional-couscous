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
