const jwt = require("jsonwebtoken");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", "my.env") });

function verifyToken(req, res, next) {
  const token =
    req.cookies?.token ||
    req.header("Authorization")?.replace("Bearer ", "") ||
    null;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("JWT_SECRET missing — cannot verify token");
    return res.status(500).json({ message: "Server misconfiguration" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  };
}

const isAdmin = authorizeRoles("admin");
const isStudent = authorizeRoles("student");
const isProfessor = authorizeRoles("professor");
const isHod = authorizeRoles("hod");

module.exports = {
  verifyToken,
  authorizeRoles,
  isAdmin,
  isStudent,
  isProfessor,
  isHod,
};
