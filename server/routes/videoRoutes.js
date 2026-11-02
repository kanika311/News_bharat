const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const { requireAuth, checkRole } = require("../middleware/auth");

router.get("/", videoController.getVideos);
router.post("/", requireAuth, checkRole(["superadmin", "editor", "reporter", "admin"]), videoController.createVideo);
router.put("/:id", requireAuth, checkRole(["superadmin", "editor", "reporter", "admin"]), videoController.updateVideo);
router.delete("/:id", requireAuth, checkRole(["superadmin", "editor", "reporter", "admin"]), videoController.deleteVideo);

module.exports = router;
