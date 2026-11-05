const express = require("express");
const router = express.Router();
const epaperController = require("../controllers/epaperController");
const { requireAuth, checkRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public routes
router.get("/", epaperController.getPublicEPaper);
router.post("/:id/download", epaperController.trackDownload);

// Admin routes (Editor / Superadmin)
router.get(
  "/admin/list",
  requireAuth,
  checkRole(["superadmin", "editor"]),
  epaperController.getAdminEPapers
);

router.post(
  "/",
  requireAuth,
  checkRole(["superadmin", "editor"]),
  upload.single("pdf"),
  epaperController.createEPaper
);

router.put(
  "/:id",
  requireAuth,
  checkRole(["superadmin", "editor"]),
  upload.single("pdf"),
  epaperController.updateEPaper
);

router.put(
  "/:id/toggle-status",
  requireAuth,
  checkRole(["superadmin", "editor"]),
  epaperController.toggleStatus
);

router.delete(
  "/:id",
  requireAuth,
  checkRole(["superadmin", "editor"]),
  epaperController.deleteEPaper
);

module.exports = router;
