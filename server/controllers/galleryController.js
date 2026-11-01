const PhotoGallery = require("../models/PhotoGallery");
const { makeUniqueSlug } = require("../utils/slugify");
const { logActivity } = require("../utils/activity");

// GET /api/galleries
exports.getGalleries = async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    const galleries = await PhotoGallery.find()
      .populate("category", "name nameHi slug")
      .sort("-createdAt")
      .limit(Number(limit))
      .lean();

    return res.json({ success: true, galleries });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/galleries/:slug
exports.getGalleryBySlug = async (req, res) => {
  try {
    const gallery = await PhotoGallery.findOne({ slug: req.params.slug }).populate("category", "name nameHi slug");
    if (!gallery) {
      return res.status(404).json({ success: false, message: "Gallery not found" });
    }
    return res.json({ success: true, gallery });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/galleries
exports.createGallery = async (req, res) => {
  try {
    const { title, titleHi, slug, description, coverImage, photos = [], category } = req.body;
    if (!title || !coverImage) {
      return res.status(400).json({ success: false, message: "Title and cover image are required." });
    }

    const uniqueSlug = await makeUniqueSlug(PhotoGallery, slug || title);

    const gallery = new PhotoGallery({
      title,
      titleHi: titleHi || title,
      slug: uniqueSlug,
      description: description || "",
      coverImage,
      photos,
      category: category || null,
    });

    await gallery.save();
    await logActivity(req, "CREATE_GALLERY", "gallery", `Created photo gallery: "${title}"`);

    return res.status(201).json({ success: true, gallery, message: "Gallery created successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/galleries/:id
exports.updateGallery = async (req, res) => {
  try {
    const gallery = await PhotoGallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ success: false, message: "Gallery not found" });
    }

    const { title, titleHi, slug, description, coverImage, photos, category } = req.body;
    if (title !== undefined) gallery.title = title;
    if (titleHi !== undefined) gallery.titleHi = titleHi;
    if (description !== undefined) gallery.description = description;
    if (coverImage !== undefined) gallery.coverImage = coverImage;
    if (photos !== undefined) gallery.photos = photos;
    if (category !== undefined) gallery.category = category || null;

    if (slug && slug !== gallery.slug) {
      gallery.slug = await makeUniqueSlug(PhotoGallery, slug, gallery._id);
    }

    await gallery.save();
    await logActivity(req, "UPDATE_GALLERY", "gallery", `Updated photo gallery: "${gallery.title}"`);

    return res.json({ success: true, gallery, message: "Gallery updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/galleries/:id
exports.deleteGallery = async (req, res) => {
  try {
    const gallery = await PhotoGallery.findByIdAndDelete(req.params.id);
    if (!gallery) {
      return res.status(404).json({ success: false, message: "Gallery not found" });
    }

    await logActivity(req, "DELETE_GALLERY", "gallery", `Deleted photo gallery: "${gallery.title}"`);
    return res.json({ success: true, message: "Gallery deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
