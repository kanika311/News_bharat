const express = require("express");
const router = express.Router();
const liveBlogController = require("../controllers/liveBlogController");
const { requireAuth, checkRole } = require("../middleware/auth");

router.get("/", liveBlogController.getLiveBlogs);
router.get("/:slug", liveBlogController.getLiveBlogBySlug);

// Protected
router.post("/", requireAuth, checkRole(["superadmin", "editor", "reporter"]), liveBlogController.createLiveBlog);
router.post("/:id/entries", requireAuth, checkRole(["superadmin", "editor", "reporter"]), liveBlogController.addEntry);
router.put("/:id", requireAuth, checkRole(["superadmin", "editor"]), liveBlogController.updateLiveBlog);
router.delete("/:id", requireAuth, checkRole(["superadmin", "editor"]), liveBlogController.deleteLiveBlog);

module.exports = router;
