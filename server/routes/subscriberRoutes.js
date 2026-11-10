const express = require("express");
const router = express.Router();
const subscriberController = require("../controllers/subscriberController");
const { requireAuth, checkRole } = require("../middleware/auth");

// Public (Support both POST /api/subscribers and POST /api/subscribers/subscribe)
router.post("/", subscriberController.subscribe);
router.post("/subscribe", subscriberController.subscribe);

// Admin
router.get("/", requireAuth, checkRole(["superadmin", "editor"]), subscriberController.getSubscribers);
router.get("/export-csv", requireAuth, checkRole(["superadmin", "editor"]), subscriberController.exportSubscribersCSV);
router.delete("/:id", requireAuth, checkRole(["superadmin", "editor"]), subscriberController.deleteSubscriber);

module.exports = router;
