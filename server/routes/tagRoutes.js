const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");
const { requireAuth, checkRole } = require("../middleware/auth");

router.get("/", tagController.getTags);
router.post("/", requireAuth, checkRole(["superadmin", "editor"]), tagController.createTag);
router.put("/:id", requireAuth, checkRole(["superadmin", "editor"]), tagController.updateTag);
router.delete("/:id", requireAuth, checkRole(["superadmin", "editor"]), tagController.deleteTag);

module.exports = router;
