const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");
const { requireAuth, checkRole } = require("../middleware/auth");

// Public
router.get("/slug/:slug", pageController.getPageBySlug);

// Admin
router.get("/", pageController.getPages);
router.post("/", requireAuth, checkRole(["superadmin", "editor"]), pageController.createPage);
router.put("/:id", requireAuth, checkRole(["superadmin", "editor"]), pageController.updatePage);
router.delete("/:id", requireAuth, checkRole(["superadmin"]), pageController.deletePage);

module.exports = router;
