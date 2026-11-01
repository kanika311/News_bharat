const express = require("express");
const router = express.Router();
const adController = require("../controllers/adController");
const { requireAuth, checkRole } = require("../middleware/auth");

// Public
router.get("/slot/:slot", adController.getAdBySlot);
router.post("/:id/click", adController.trackClick);

// Admin
router.get("/", requireAuth, checkRole(["superadmin", "editor"]), adController.getAdminAds);
router.post("/", requireAuth, checkRole(["superadmin", "editor"]), adController.createAd);
router.put("/:id", requireAuth, checkRole(["superadmin", "editor"]), adController.updateAd);
router.delete("/:id", requireAuth, checkRole(["superadmin", "editor"]), adController.deleteAd);

module.exports = router;
