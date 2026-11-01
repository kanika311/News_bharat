const express = require("express");
const router = express.Router();
const settingController = require("../controllers/settingController");
const { requireAuth, checkRole } = require("../middleware/auth");

// Public can read general site settings
router.get("/", settingController.getSettings);

// Admin can update
router.put("/", requireAuth, checkRole(["superadmin", "editor"]), settingController.updateSettings);
router.put("/homepage-layout", requireAuth, checkRole(["superadmin", "editor"]), settingController.updateHomepageLayout);

module.exports = router;
