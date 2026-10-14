const { verifyToken } = require("../utils/jwt");

// Sets req.user when a valid token is sent, otherwise continues anonymously
function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const decoded = verifyToken(authHeader.split(" ")[1]);
      if (decoded.type !== "admin") {
        req.user = { id: decoded.id, role: decoded.role };
      }
    } catch (error) {
      // Invalid token is treated as anonymous
    }
  }
  next();
}

module.exports = optionalAuthMiddleware;
