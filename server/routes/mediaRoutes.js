const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const upload = require("../middleware/upload");
const { requireAuth } = require("../middleware/auth");

router.post("/upload", requireAuth, upload.single("image"), mediaController.uploadMedia);
router.get("/", requireAuth, mediaController.getMediaLibrary);
router.delete("/:filename", requireAuth, mediaController.deleteMedia);

module.exports = router;
