const Comment = require("../models/Comment");
const Article = require("../models/Article");
const { logActivity } = require("../utils/activity");

// GET /api/comments/article/:articleId (Public - only approved)
exports.getCommentsForArticle = async (req, res) => {
  try {
    const comments = await Comment.find({
      article: req.params.articleId,
      status: "approved",
    }).sort("-createdAt").lean();

    return res.json({ success: true, comments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/comments (Public submission)
exports.createComment = async (req, res) => {
  try {
    const { articleId, name, email, content } = req.body;
    if (!articleId || !name || !email || !content) {
      return res.status(400).json({ success: false, message: "All fields are required to post a comment." });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found." });
    }

    // Basic spam filtering
    const isSpam = /viagra|casino|crypto\s*profit|dating\s*now|buy\s*followers/i.test(content);

    const comment = new Comment({
      article: articleId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      content: content.trim(),
      status: isSpam ? "spam" : "pending",
    });

    await comment.save();

    return res.status(201).json({
      success: true,
      message: isSpam
        ? "Comment flagged for moderation."
        : "Thank you! Your comment is awaiting editor moderation.",
      comment,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/comments/admin (Admin view with filters)
exports.getAdminComments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate("article", "title slug")
        .sort("-createdAt")
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Comment.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      comments,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      page: pageNum,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/comments/:id/status
exports.updateCommentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected", "spam"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    comment.status = status;
    await comment.save();

    await logActivity(req, "UPDATE_COMMENT_STATUS", "comment", `Changed status to ${status} for comment by ${comment.name}`);

    return res.json({ success: true, comment, message: `Comment marked as ${status}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    await logActivity(req, "DELETE_COMMENT", "comment", `Deleted comment from ${comment.name}`);
    return res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
