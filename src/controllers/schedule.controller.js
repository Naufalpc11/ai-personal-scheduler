const asyncHandler = require("../utils/asyncHandler");
const scheduleService = require("../services/schedule.service");

const createSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.createSchedule(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Schedule created",
    data: schedule,
  });
});

const getSchedules = asyncHandler(async (req, res) => {
  const schedules = await scheduleService.getSchedules(req.user.id);

  res.status(200).json({
    success: true,
    data: schedules,
  });
});

const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.updateSchedule(req.user.id, req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Schedule updated",
    data: schedule,
  });
});

const deleteSchedule = asyncHandler(async (req, res) => {
  await scheduleService.deleteSchedule(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: "Schedule deleted",
  });
});

module.exports = {
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
};
