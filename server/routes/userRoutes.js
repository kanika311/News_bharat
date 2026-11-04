const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireAuth, checkRole } = require("../middleware/auth");

const allowedRoles = ["superadmin", "editor", "admin"];

// List users & user by ID
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);

// View user activity (all posts, approved, views, comments, likes)
router.get("/:id/activity", requireAuth, checkRole(allowedRoles), userController.getUserActivity);

// Admin user actions: Create, Edit, Activate/Deactivate, Delete
router.post("/", requireAuth, checkRole(allowedRoles), userController.createUser);
router.put("/:id", requireAuth, checkRole(allowedRoles), userController.updateUser);
router.delete("/:id", requireAuth, checkRole(allowedRoles), userController.deleteUser);

module.exports = router;
