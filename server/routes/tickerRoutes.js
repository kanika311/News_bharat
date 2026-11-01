const express = require("express");
const router = express.Router();
const tickerController = require("../controllers/tickerController");
const { requireAuth, checkRole } = require("../middleware/auth");

router.get("/", tickerController.getTickers);
router.post("/", requireAuth, checkRole(["superadmin", "editor"]), tickerController.createTicker);
router.put("/:id", requireAuth, checkRole(["superadmin", "editor"]), tickerController.updateTicker);
router.delete("/:id", requireAuth, checkRole(["superadmin", "editor"]), tickerController.deleteTicker);

module.exports = router;
