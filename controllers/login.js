const getAuthTokenId = require("./redis").getAuthTokenId;
const createSession = require("./redis").createSession;

const login = (db, argon2, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return Promise.reject();
  return db
    .select()
    .table("users")
    .where({
      email: email,
    })
    .then(async (users) => {
      const user = users[0];
      try {
        if (await argon2.verify(user.password, password)) {
          return {
            email: user.email,
            firstName: user["first_name"],
            lastName: user["last_name"],
            id: user.id,
            joined: user.joined,
          };
        } else return Promise.reject();
      } catch (err) {
        return Promise.reject();
      }
    })
    .catch((err) => Promise.reject());
};

const loginWithAuth = (db, argon2) => (req, res) => {
  const { authorization } = req.headers;
  return authorization
    ? getAuthTokenId(req, res)
    : login(db, argon2, req, res)
        .then((data) => {
          return data.id && data.email
            ? createSession(data)
            : Promise.reject("Login failed; server error");
        })
        .then((session) => res.json(session))
        .catch((err) => res.status(400).json("Login failed; Server error."));
  // return authorization ? getAuthTokenId : login(db, argon2);
};

module.exports = {
  loginWithAuth,
};
