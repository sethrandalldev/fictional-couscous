const jwt = require("jsonwebtoken");
const Redis = require("ioredis");
const redisClient = new Redis(process.env.REDIS_URL || process.env.REDIS_URI);

const signToken = (userId) => {
  const jwtPayload = { userId };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: "2 days" });
};

const setToken = async (key, value) => {
  return redisClient.set(key, value);
};

const createSession = (user) => {
  const { id } = user;
  const token = signToken(id);
  return setToken(id, token)
    .then(() => {
      return { success: "true", userId: id, token };
    })
    .catch(console.log);
};

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  const token = authorization.replace(/^Bearer\s+/, "");
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(400).json("Unauthorized");
    else {
      return redisClient.get(decoded.userId, (err, result) => {
        if (err || !result || token !== result) {
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

module.exports = {
  redisClient,
  getAuthTokenId,
  createSession,
};
