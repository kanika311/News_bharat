const User = require("../models/User");
const { logActivity } = require("../utils/activity");

// GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter).select("-password").sort("-createdAt").lean();
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, bio, bioHi, avatar } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already registered." });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || "reporter",
      bio: bio || "",
      bioHi: bioHi || "",
      avatar: avatar || "",
    });

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;

    await logActivity(req, "CREATE_USER", "user", `Created user: ${name} (${email}) as ${role}`);

    return res.status(201).json({ success: true, user: userObj, message: "User account created" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, email, role, bio, bioHi, avatar, isActive, password } = req.body;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (role !== undefined) user.role = role;
    if (bio !== undefined) user.bio = bio;
    if (bioHi !== undefined) user.bioHi = bioHi;
    if (avatar !== undefined) user.avatar = avatar;
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (password) user.password = password; // will trigger pre-save hash

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;

    await logActivity(req, "UPDATE_USER", "user", `Updated user: ${user.name}`);

    return res.json({ success: true, user: userObj, message: "User profile updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await logActivity(req, "DELETE_USER", "user", `Deleted user: ${user.name}`);
    return res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
