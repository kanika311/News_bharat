const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "bharat_varta_super_secure_jwt_secret_key_2026_x99";

/**
 * Authentication middleware: verifies JWT token from cookies or Authorization header
 */
async function requireAuth(req, res, next) {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required. Please log in." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      return res.status(401).json({ success: false, message: "User account no longer exists." });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account is deactivated. Contact Administrator." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session. Please log in again." });
  }
}

/**
 * Role-based access control middleware
 * e.g. checkRole(['superadmin', 'editor'])
 */
function checkRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(", ")}]. Your role: ${req.user.role}`,
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  checkRole,
  JWT_SECRET,
};
