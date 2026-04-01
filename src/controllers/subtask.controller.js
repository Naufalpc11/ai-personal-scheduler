const asyncHandler = require("../utils/asyncHandler");
const subtaskService = require("../services/subtask.service");

const createSubtask = asyncHandler(async (req, res) => {
  const subtask = await subtaskService.createSubtask(req.user.id, req.params.id, req.body);

  res.status(201).json({
    success: true,
    message: "Subtask created",
    data: subtask,
  });
});

const getSubtasksByTask = asyncHandler(async (req, res) => {
  const subtasks = await subtaskService.getSubtasksByTask(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    data: subtasks,
  });
});

const updateSubtask = asyncHandler(async (req, res) => {
  const subtask = await subtaskService.updateSubtask(req.user.id, req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Subtask updated",
    data: subtask,
  });
});

const deleteSubtask = asyncHandler(async (req, res) => {
  await subtaskService.deleteSubtask(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: "Subtask deleted",
  });
});

module.exports = {
  createSubtask,
  getSubtasksByTask,
  updateSubtask,
  deleteSubtask,
};
