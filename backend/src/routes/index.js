const express = require("express");
const authRoutes = require("./auth.routes");
const taskRoutes = require("./task.routes");
const scheduleRoutes = require("./schedule.routes");
const aiRoutes = require("./ai.routes");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authRoutes);
router.use(protect);
router.use(taskRoutes);
router.use(scheduleRoutes);
router.use(aiRoutes);

module.exports = router;
