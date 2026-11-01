const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const { requireAuth, checkRole } = require("../middleware/auth");

router.get("/", videoController.getVideos);
router.post("/", requireAuth, checkRole(["superadmin", "editor", "reporter"]), videoController.createVideo);
router.put("/:id", requireAuth, checkRole(["superadmin", "editor"]), videoController.updateVideo);
router.delete("/:id", requireAuth, checkRole(["superadmin", "editor"]), videoController.deleteVideo);

module.exports = router;
