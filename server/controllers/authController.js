const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../middleware/auth");
const { logActivity } = require("../utils/activity");

// Helper to sign JWT
const signToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const normalizedEmail = (email || "").trim().toLowerCase();
    
    // Auto-retry once on transient network glitch
    let user;
    try {
      user = await User.findOne({ email: normalizedEmail }).select("+password");
    } catch (queryErr) {
      if (queryErr.name === "MongoNetworkError" || queryErr.message?.includes("closed") || queryErr.message?.includes("ECONNRESET")) {
        console.warn("[MongoDB] Transient network error during login query. Retrying in 300ms...");
        await new Promise((r) => setTimeout(r, 300));
        user = await User.findOne({ email: normalizedEmail }).select("+password");
      } else {
        throw queryErr;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    user.lastLogin = new Date();
    await user.save().catch(() => {});

    const token = signToken(user._id, user.role);

    // Set HTTP-Only Cookie with explicit root path
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userObject = user.toObject();
    delete userObject.password;

    req.user = userObject;
    await logActivity(req, "LOGIN", "auth", `User logged in: ${user.email}`).catch(() => {});

    return res.json({
      success: true,
      token,
      user: userObject,
      message: "Logged in successfully",
    });
  } catch (err) {
    console.error("Login error:", err);
    const isNetworkErr =
      err.name === "MongoNetworkError" ||
      err.message?.includes("ECONNRESET") ||
      err.message?.includes("closed");
    return res.status(500).json({
      success: false,
      message: isNetworkErr
        ? "डेटाबेस कनेक्शन में अस्थायी समस्या आई। कृपया 2 सेकंड बाद पुनः प्रयास करें।"
        : err.message,
    });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  // Explicitly clear cookie for root and API paths with matching attributes
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
  });
  res.clearCookie("token", { path: "/" });
  res.clearCookie("token", { path: "/api" });
  res.clearCookie("token", { path: "/api/auth" });
  res.clearCookie("token");

  // Force Set-Cookie header overrides to guarantee that all browsers invalidate it
  res.setHeader("Set-Cookie", [
    `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax${isProd ? "; Secure" : ""}`,
    `token=; Path=/api; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax${isProd ? "; Secure" : ""}`,
    `token=; Path=/api/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax${isProd ? "; Secure" : ""}`,
  ]);

  return res.json({ success: true, message: "Logged out successfully" });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = (email || "").trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const user = await User.create({
      name: (name || "").trim(),
      email: normalizedEmail,
      password,
      role: "reader",
    });

    const token = signToken(user._id, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObject = user.toObject();
    delete userObject.password;

    req.user = userObject;
    await logActivity(req, "REGISTER", "auth", `Reader registered: ${user.email}`);

    return res.status(201).json({
      success: true,
      token,
      user: userObject,
      message: "Account created successfully",
    });
  } catch (err) {
    console.error("Register error:", err);
    const isNetworkErr =
      err.name === "MongoNetworkError" ||
      err.message?.includes("ECONNRESET") ||
      err.message?.includes("closed");
    return res.status(500).json({
      success: false,
      message: isNetworkErr
        ? "डेटाबेस कनेक्शन में अस्थायी समस्या आई। कृपया 2 सेकंड बाद पुनः प्रयास करें।"
        : err.message,
    });
  }
};

// POST /api/auth/bookmarks
exports.toggleBookmark = async (req, res) => {
  try {
    const { articleId } = req.body;
    if (!articleId) {
      return res.status(400).json({ success: false, message: "Article ID required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const index = user.bookmarks.indexOf(articleId);
    let bookmarked = false;
    if (index > -1) {
      user.bookmarks.splice(index, 1);
      bookmarked = false;
    } else {
      user.bookmarks.push(articleId);
      bookmarked = true;
    }

    await user.save();
    return res.json({ success: true, bookmarked, bookmarks: user.bookmarks });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new passwords are required." });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password does not match." });
    }

    user.password = newPassword;
    await user.save();

    await logActivity(req, "CHANGE_PASSWORD", "auth", "User changed password");
    return res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, district, bio, avatar, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name.trim();
    if (district !== undefined) user.district = district.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();
    const userObject = user.toObject();
    delete userObject.password;

    await logActivity(req, "UPDATE_PROFILE", "auth", `User updated profile: ${user.email}`);
    return res.json({
      success: true,
      user: userObject,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
