const LiveBlog = require("../models/LiveBlog");
const { makeUniqueSlug } = require("../utils/slugify");
const { logActivity } = require("../utils/activity");

// GET /api/live-blogs
exports.getLiveBlogs = async (req, res) => {
  try {
    const { status, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const blogs = await LiveBlog.find(filter)
      .populate("category", "name nameHi slug")
      .sort("-updatedAt")
      .limit(Number(limit))
      .lean();

    return res.json({ success: true, liveBlogs: blogs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/live-blogs/:slug
exports.getLiveBlogBySlug = async (req, res) => {
  try {
    const blog = await LiveBlog.findOne({ slug: req.params.slug }).populate("category", "name nameHi slug");
    if (!blog) {
      return res.status(404).json({ success: false, message: "Live blog not found" });
    }
    // Sort entries newest first
    blog.entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return res.json({ success: true, liveBlog: blog });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/live-blogs
exports.createLiveBlog = async (req, res) => {
  try {
    const { title, titleHi, slug, coverImage, category } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required." });
    }

    const uniqueSlug = await makeUniqueSlug(LiveBlog, slug || title);

    const blog = new LiveBlog({
      title,
      titleHi: titleHi || title,
      slug: uniqueSlug,
      coverImage: coverImage || "",
      category: category || null,
      status: "live",
      entries: [],
    });

    await blog.save();
    await logActivity(req, "CREATE_LIVE_BLOG", "live-blog", `Created live blog: "${title}"`);

    return res.status(201).json({ success: true, liveBlog: blog, message: "Live blog started" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/live-blogs/:id/entries
exports.addEntry = async (req, res) => {
  try {
    const { title, content, authorName } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required for update." });
    }

    const blog = await LiveBlog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Live blog not found" });
    }

    const newEntry = {
      title,
      content,
      authorName: authorName || (req.user ? req.user.name : "Bharat Varta Desk"),
      timestamp: new Date(),
    };

    blog.entries.unshift(newEntry);
    await blog.save();

    await logActivity(req, "ADD_LIVE_ENTRY", "live-blog", `Added update to live blog: "${blog.title}"`);

    return res.status(201).json({ success: true, entry: newEntry, message: "Live update published" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/live-blogs/:id
exports.updateLiveBlog = async (req, res) => {
  try {
    const blog = await LiveBlog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Live blog not found" });
    }

    const { title, titleHi, status, coverImage, category } = req.body;
    if (title !== undefined) blog.title = title;
    if (titleHi !== undefined) blog.titleHi = titleHi;
    if (status !== undefined) blog.status = status;
    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (category !== undefined) blog.category = category || null;

    await blog.save();
    await logActivity(req, "UPDATE_LIVE_BLOG", "live-blog", `Updated live blog: "${blog.title}"`);

    return res.json({ success: true, liveBlog: blog, message: "Live blog updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/live-blogs/:id
exports.deleteLiveBlog = async (req, res) => {
  try {
    const blog = await LiveBlog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Live blog not found" });
    }

    await logActivity(req, "DELETE_LIVE_BLOG", "live-blog", `Deleted live blog: "${blog.title}"`);
    return res.json({ success: true, message: "Live blog deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
