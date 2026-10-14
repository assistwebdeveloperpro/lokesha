const { verifyToken } = require("../utils/jwt");

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication token is required" });
  }

  try {
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (decoded.type !== "admin") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.admin = { id: decoded.id };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = adminAuthMiddleware;
