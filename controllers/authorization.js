const redisClient = require("./redis").redisClient;
const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    console.log("no authorization");
    return res.status(401).json("Unauthorized");
  }
  jwt.verify(authorization, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json("Unauthorized jwt");
    console.log("decoded: ", decoded);
    return redisClient.get(decoded.userId, (err, result) => {
      if (err || !result || authorization !== result) {
        console.log("err: ", err);
        console.log("result: ", result);
        return res.status(401).json("Unauthorized");
      }
      req.userId = decoded.userId;
      return next(decoded);
    });
  });
};

module.exports = {
  requireAuth,
};
