const jwt = require('jsonwebtoken');

const checkToken = (req, res, next) => {
  const token = req.cookies?.token;

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
