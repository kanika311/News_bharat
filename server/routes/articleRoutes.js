const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const { requireAuth, checkRole } = require("../middleware/auth");

// Public endpoints
router.get("/", articleController.getArticles);
router.get("/slug/:slug", articleController.getArticleBySlug);
router.get("/related/:id", articleController.getRelatedArticles);
router.post("/:id/like", articleController.likeArticle);
router.get("/:id", articleController.getArticleById);

// Protected endpoints (reporters, editors, superadmins)
router.post("/", requireAuth, articleController.createArticle);
router.put("/:id", requireAuth, articleController.updateArticle);
router.post("/:id/social-share", requireAuth, articleController.recordSocialShare);
router.delete("/:id", requireAuth, articleController.softDeleteArticle);
router.post("/:id/restore", requireAuth, articleController.restoreArticle);

// Restricted actions (editor / superadmin only)
router.delete(
  "/:id/permanent",
  requireAuth,
  checkRole(["superadmin", "editor"]),
  articleController.permanentDeleteArticle
);
router.post(
  "/bulk",
  requireAuth,
  checkRole(["superadmin", "editor"]),
  articleController.bulkAction
);

module.exports = router;
