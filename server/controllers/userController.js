const User = require("../models/User");
const Article = require("../models/Article");
const Comment = require("../models/Comment");
const { logActivity } = require("../utils/activity");

// GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { role, search, status } = req.query;
    const filter = {};
    if (role && role !== "all") filter.role = role;
    if (status === "active") filter.isActive = true;
    if (status === "deactivated") filter.isActive = false;

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { district: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(filter).select("-password").sort("-createdAt").lean();

    // Enrich each user with post and comment counts
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const [articleStats, commentsCount] = await Promise.all([
          Article.aggregate([
            { $match: { author: u._id, isDeleted: { $ne: true } } },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                approved: {
                  $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
                },
                pending: {
                  $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                },
                views: { $sum: "$viewCount" },
                likes: { $sum: "$likesCount" },
              },
            },
          ]),
          Comment.countDocuments({ email: u.email }),
        ]);

        const stats = articleStats[0] || { total: 0, approved: 0, pending: 0, views: 0, likes: 0 };

        return {
          ...u,
          postStats: {
            total: stats.total,
            approved: stats.approved,
            pending: stats.pending,
            views: stats.views,
            likes: stats.likes,
            comments: commentsCount,
          },
        };
      })
    );

    return res.json({ success: true, users: enrichedUsers });
  } catch (err) {
    console.error("getUsers error:", err);
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

// GET /api/users/:id/activity
exports.getUserActivity = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. All articles written by this user
    const articles = await Article.find({ author: user._id, isDeleted: { $ne: true } })
      .populate("category", "name nameHi slug")
      .sort("-createdAt")
      .lean();

    // 2. All comments written by this user
    const comments = await Comment.find({ email: user.email })
      .populate("article", "title slug category")
      .sort("-createdAt")
      .lean();

    const stats = {
      totalPosts: articles.length,
      approvedCount: articles.filter((a) => a.status === "published").length,
      pendingCount: articles.filter((a) => a.status === "pending").length,
      draftCount: articles.filter((a) => a.status === "draft").length,
      totalViews: articles.reduce((sum, a) => sum + (a.viewCount || 0), 0),
      totalLikes: articles.reduce((sum, a) => sum + (a.likesCount || 0), 0),
      totalComments: comments.length,
    };

    return res.json({
      success: true,
      user,
      articles,
      comments,
      stats,
    });
  } catch (err) {
    console.error("getUserActivity error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      bio,
      bioHi,
      avatar,
      district,
      phone,
      isVerifiedJournalist,
      isActive,
    } = req.body;

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
      role: role || "reader",
      bio: bio || "",
      bioHi: bioHi || "",
      avatar: avatar || "",
      district: district || "सुल्तानपुर",
      phone: phone || "",
      isVerifiedJournalist: isVerifiedJournalist !== false,
      isActive: isActive !== false,
    });

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;

    await logActivity(req, "CREATE_USER", "user", `Created user: ${name} (${email}) as ${role}`);

    return res.status(201).json({ success: true, user: userObj, message: "User account created successfully" });
  } catch (err) {
    console.error("createUser error:", err);
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

    const {
      name,
      email,
      role,
      bio,
      bioHi,
      avatar,
      district,
      phone,
      isVerifiedJournalist,
      isActive,
      password,
    } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (role !== undefined) user.role = role;
    if (bio !== undefined) user.bio = bio;
    if (bioHi !== undefined) user.bioHi = bioHi;
    if (avatar !== undefined) user.avatar = avatar;
    if (district !== undefined) user.district = district;
    if (phone !== undefined) user.phone = phone;
    if (isVerifiedJournalist !== undefined) user.isVerifiedJournalist = Boolean(isVerifiedJournalist);
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (password) user.password = password; // triggers pre-save bcrypt hash

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;

    await logActivity(req, "UPDATE_USER", "user", `Updated user: ${user.name} (Status: ${user.isActive ? "Active" : "Deactivated"})`);

    return res.json({ success: true, user: userObj, message: "User profile updated successfully" });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.user && req.user._id && req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own logged-in account." });
    }

    let user;
    try {
      user = await User.findByIdAndDelete(req.params.id);
    } catch (queryErr) {
      if (
        queryErr.name === "MongoNetworkError" ||
        queryErr.message?.includes("closed") ||
        queryErr.message?.includes("ECONNRESET")
      ) {
        console.warn("[MongoDB] Transient network error during user delete. Retrying in 300ms...");
        await new Promise((r) => setTimeout(r, 300));
        user = await User.findByIdAndDelete(req.params.id);
      } else {
        throw queryErr;
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await logActivity(req, "DELETE_USER", "user", `Deleted user account: ${user.name} (${user.email})`).catch(() => {});
    return res.json({ success: true, message: "User account deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
