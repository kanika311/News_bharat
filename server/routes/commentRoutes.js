const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { requireAuth, checkRole } = require("../middleware/auth");

// Public
router.get("/article/:articleId", commentController.getCommentsForArticle);
router.post("/", commentController.createComment);

// Admin Moderation
router.get("/admin/list", requireAuth, checkRole(["superadmin", "editor"]), commentController.getAdminComments);
router.put("/:id/status", requireAuth, checkRole(["superadmin", "editor"]), commentController.updateCommentStatus);
router.delete("/:id", requireAuth, checkRole(["superadmin", "editor"]), commentController.deleteComment);

module.exports = router;
