const express = require("express");
const router = express.Router();
const liveStreamController = require("../controllers/liveStreamController");
const upload = require("../middleware/upload");
const { requireAuth, checkRole } = require("../middleware/auth");

// Public route to get live stream info
router.get("/", liveStreamController.getLiveStream);

// Protected routes to update live stream & upload broadcast
router.put(
  "/",
  requireAuth,
  checkRole(["superadmin", "editor", "reporter", "admin"]),
  liveStreamController.updateLiveStream
);

router.post(
  "/upload-chunk",
  requireAuth,
  checkRole(["superadmin", "editor", "reporter", "admin"]),
  upload.single("video"),
  liveStreamController.uploadCameraBroadcast
);

module.exports = router;
