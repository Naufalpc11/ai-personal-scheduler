const asyncHandler = require("../utils/asyncHandler");
const taskService = require("../services/task.service");

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Task created",
    data: task,
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasks(req.user.id);

  res.status(200).json({
    success: true,
    data: tasks,
  });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    data: task,
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.user.id, req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Task updated",
    data: task,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: "Task deleted",
  });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
