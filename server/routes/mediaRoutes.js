const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const upload = require("../middleware/upload");
const { requireAuth } = require("../middleware/auth");

// Public streamer for persisted media assets (images/videos/PDFs)
router.get("/file/:id", mediaController.serveMediaFile);
router.get("/file/:id/:filename", mediaController.serveMediaFile);

// Protected routes (Admin / Reporter)
router.post("/upload", requireAuth, upload.any(), mediaController.uploadMedia);
router.get("/", requireAuth, mediaController.getMediaLibrary);
router.delete("/:filename", requireAuth, mediaController.deleteMedia);

module.exports = router;
