// backend/Middleware/authToken.js

const jwt = require('jsonwebtoken');

const checkToken = (req, res, next) => {
  let token = req.cookies?.token;

  // If no cookie, check for Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7, authHeader.length);
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Verify token
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.restaurant = { id: decoded.id };
    next();
  }
  catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = checkToken;