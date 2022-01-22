const jwt = require("jsonwebtoken");
const Redis = require("ioredis");
const redisClient = new Redis(process.env.REDIS_URI);

const signToken = (userId) => {
  const jwtPayload = { userId };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: "2 days" });
};

const setToken = async (key, value) => {
  return redisClient.set(key, value);
};

const createSession = (user) => {
  const { email, id } = user;
  const token = signToken(id);
  return setToken(id, token)
    .then(() => {
      return { success: "true", userId: id, token };
    })
    .catch(console.log);
};

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  jwt.verify(authorization, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(400).json("Unauthorized");
    else {
      return redisClient.get(decoded.userId, (err, result) => {
        if (err || !result || authorization !== result) {
          return res.status(400).json("Unauthorized");
        } else {
          return res.json({
            userId: decoded.userId,
            token: result,
            sucess: "true",
          });
        }
      });
    }
  });
};

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
  redisClient,
};
