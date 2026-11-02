const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/galleryController");
const { requireAuth, checkRole } = require("../middleware/auth");

router.get("/", galleryController.getGalleries);
router.get("/:slug", galleryController.getGalleryBySlug);
router.post("/", requireAuth, checkRole(["superadmin", "editor", "reporter", "admin"]), galleryController.createGallery);
router.put("/:id", requireAuth, checkRole(["superadmin", "editor", "reporter", "admin"]), galleryController.updateGallery);
router.delete("/:id", requireAuth, checkRole(["superadmin", "editor", "reporter", "admin"]), galleryController.deleteGallery);

module.exports = router;
