const redisClient = require("./redis").redisClient;
const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json("Unauthorized");
  }
  // Remove Bearer from string
  const token = authorization.replace(/^Bearer\s+/, "");
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json(err);
    return redisClient.get(decoded.userId, (err, result) => {
      if (err || !result || token !== result) {
        return res.status(401).json("Unauthorized");
      }
      req.userId = decoded.userId;
      return next();
    });
  });
};

module.exports = {
  requireAuth,
};
