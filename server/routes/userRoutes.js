const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireAuth, checkRole } = require("../middleware/auth");

// Public / authors list
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);

// Superadmin only for creating/updating/deleting users
router.post("/", requireAuth, checkRole(["superadmin"]), userController.createUser);
router.put("/:id", requireAuth, checkRole(["superadmin", "editor"]), userController.updateUser);
router.delete("/:id", requireAuth, checkRole(["superadmin"]), userController.deleteUser);

module.exports = router;
