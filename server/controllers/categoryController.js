const Category = require("../models/Category");
const { makeUniqueSlug } = require("../utils/slugify");
const { logActivity } = require("../utils/activity");

// GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    const { menuOnly } = req.query;
    const filter = {};
    if (menuOnly === "true") {
      filter.showInMenu = true;
    }

    const categories = await Category.find(filter)
      .populate("parentCategory", "name nameHi slug")
      .sort("order")
      .lean();

    res.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    return res.json({ success: true, categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/categories/:id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.json({ success: true, category });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, nameHi, slug, description, order, showInMenu, color, parentCategory } = req.body;
    if (!name || !nameHi) {
      return res.status(400).json({ success: false, message: "English and Hindi category names are required." });
    }

    const uniqueSlug = await makeUniqueSlug(Category, slug || name);

    const category = new Category({
      name,
      nameHi,
      slug: uniqueSlug,
      description: description || "",
      order: order !== undefined ? Number(order) : 0,
      showInMenu: showInMenu !== undefined ? Boolean(showInMenu) : true,
      color: color || "#dc2626",
      parentCategory: parentCategory || null,
    });

    await category.save();
    await logActivity(req, "CREATE_CATEGORY", "category", `Created category: ${name} (${uniqueSlug})`);

    return res.status(201).json({ success: true, category, message: "Category created successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const { name, nameHi, slug, description, order, showInMenu, color, parentCategory } = req.body;

    if (name) category.name = name;
    if (nameHi) category.nameHi = nameHi;
    if (description !== undefined) category.description = description;
    if (order !== undefined) category.order = Number(order);
    if (showInMenu !== undefined) category.showInMenu = Boolean(showInMenu);
    if (color) category.color = color;
    if (parentCategory !== undefined) category.parentCategory = parentCategory || null;

    if (slug && slug !== category.slug) {
      category.slug = await makeUniqueSlug(Category, slug, category._id);
    }

    await category.save();
    await logActivity(req, "UPDATE_CATEGORY", "category", `Updated category: ${category.name}`);

    return res.json({ success: true, category, message: "Category updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await logActivity(req, "DELETE_CATEGORY", "category", `Deleted category: ${category.name}`);
    return res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
