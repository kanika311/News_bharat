const Tag = require("../models/Tag");
const { makeUniqueSlug } = require("../utils/slugify");
const { logActivity } = require("../utils/activity");

// GET /api/tags
exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort("name").lean();
    return res.json({ success: true, tags });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/tags
exports.createTag = async (req, res) => {
  try {
    const { name, nameHi, slug } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Tag name is required." });
    }

    const uniqueSlug = await makeUniqueSlug(Tag, slug || name);
    const tag = new Tag({ name, nameHi: nameHi || "", slug: uniqueSlug });
    await tag.save();

    await logActivity(req, "CREATE_TAG", "tag", `Created tag: ${name}`);
    return res.status(201).json({ success: true, tag, message: "Tag created successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/tags/:id
exports.updateTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    const { name, nameHi, slug } = req.body;
    if (name) tag.name = name;
    if (nameHi !== undefined) tag.nameHi = nameHi;
    if (slug && slug !== tag.slug) {
      tag.slug = await makeUniqueSlug(Tag, slug, tag._id);
    }

    await tag.save();
    await logActivity(req, "UPDATE_TAG", "tag", `Updated tag: ${tag.name}`);
    return res.json({ success: true, tag, message: "Tag updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/tags/:id
exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    await logActivity(req, "DELETE_TAG", "tag", `Deleted tag: ${tag.name}`);
    return res.json({ success: true, message: "Tag deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
