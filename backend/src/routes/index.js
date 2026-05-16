const express = require("express");
const authRoutes = require("./auth.routes");
const taskRoutes = require("./task.routes");
const scheduleRoutes = require("./schedule.routes");
const aiRoutes = require("./ai.routes");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authRoutes);

// Dev mode: allow mounting AI routes before auth when DISABLE_AUTH=true
// This is only for local testing. Do NOT enable in production.
if (process.env.DISABLE_AUTH === "true") {
	router.use(aiRoutes);
}

router.use(protect);
router.use(taskRoutes);
router.use(scheduleRoutes);

if (process.env.DISABLE_AUTH !== "true") {
	router.use(aiRoutes);
}

module.exports = router;
