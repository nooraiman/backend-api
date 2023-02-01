const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  var token =req.body.token || req.query.token || req.params.token || req.headers['authorization'];

  if(token) token = token.split(' ')[1]

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;
