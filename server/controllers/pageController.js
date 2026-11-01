const Page = require("../models/Page");
const { makeUniqueSlug } = require("../utils/slugify");
const { logActivity } = require("../utils/activity");

// GET /api/pages
exports.getPages = async (req, res) => {
  try {
    const pages = await Page.find().sort("title").lean();
    return res.json({ success: true, pages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/pages/:slug (Public)
exports.getPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, isActive: true });
    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }
    return res.json({ success: true, page });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/pages
exports.createPage = async (req, res) => {
  try {
    const { title, titleHi, slug, content, contentHi, isActive } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required." });
    }

    const uniqueSlug = await makeUniqueSlug(Page, slug || title);

    const page = new Page({
      title,
      titleHi: titleHi || title,
      slug: uniqueSlug,
      content,
      contentHi: contentHi || "",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await page.save();
    await logActivity(req, "CREATE_PAGE", "page", `Created static page: ${title}`);

    return res.status(201).json({ success: true, page, message: "Page created successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/pages/:id
exports.updatePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    const { title, titleHi, slug, content, contentHi, isActive } = req.body;
    if (title !== undefined) page.title = title;
    if (titleHi !== undefined) page.titleHi = titleHi;
    if (content !== undefined) page.content = content;
    if (contentHi !== undefined) page.contentHi = contentHi;
    if (isActive !== undefined) page.isActive = Boolean(isActive);

    if (slug && slug !== page.slug) {
      page.slug = await makeUniqueSlug(Page, slug, page._id);
    }

    await page.save();
    await logActivity(req, "UPDATE_PAGE", "page", `Updated static page: ${page.title}`);

    return res.json({ success: true, page, message: "Page updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/pages/:id
exports.deletePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    await logActivity(req, "DELETE_PAGE", "page", `Deleted static page: ${page.title}`);
    return res.json({ success: true, message: "Page deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
