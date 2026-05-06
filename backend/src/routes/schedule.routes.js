const express = require("express");
const scheduleController = require("../controllers/schedule.controller");
const validate = require("../middleware/validate.middleware");
const { createScheduleSchema, updateScheduleSchema, getTaskByIdSchema } = require("../utils/validators");

const router = express.Router();

router.post("/schedule", validate(createScheduleSchema), scheduleController.createSchedule);
router.get("/schedule", scheduleController.getSchedules);
router.put("/schedule/:id", validate(updateScheduleSchema), scheduleController.updateSchedule);
router.delete("/schedule/:id", validate(getTaskByIdSchema), scheduleController.deleteSchedule);

module.exports = router;
