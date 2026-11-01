const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const { requireAuth, checkRole } = require("../middleware/auth");

router.get("/", requireAuth, checkRole(["superadmin", "editor"]), activityController.getActivityLogs);

module.exports = router;
