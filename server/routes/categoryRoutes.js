const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { requireAuth, checkRole } = require("../middleware/auth");

router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", requireAuth, checkRole(["superadmin", "editor"]), categoryController.createCategory);
router.put("/:id", requireAuth, checkRole(["superadmin", "editor"]), categoryController.updateCategory);
router.delete("/:id", requireAuth, checkRole(["superadmin", "editor"]), categoryController.deleteCategory);

module.exports = router;
