const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", requireAuth, authController.getMe);
router.post("/logout", authController.logout);
router.post("/bookmarks", requireAuth, authController.toggleBookmark);
router.post("/change-password", requireAuth, authController.changePassword);

module.exports = router;
