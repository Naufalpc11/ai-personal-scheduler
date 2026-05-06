const asyncHandler = require("../utils/asyncHandler");
const subtaskService = require("../services/subtask.service");

// Menambahkan subtask baru pada task tertentu.
const createSubtask = asyncHandler(async (req, res) => {
  const subtask = await subtaskService.createSubtask(req.user.id, req.params.id, req.body);

  res.status(201).json({
    success: true,
    message: "Subtask created",
    data: subtask,
  });
});

// Mengambil seluruh subtask berdasarkan task ID.
const getSubtasksByTask = asyncHandler(async (req, res) => {
  const subtasks = await subtaskService.getSubtasksByTask(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    data: subtasks,
  });
});

// Memperbarui subtask berdasarkan ID.
const updateSubtask = asyncHandler(async (req, res) => {
  const subtask = await subtaskService.updateSubtask(req.user.id, req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Subtask updated",
    data: subtask,
  });
});

// Menghapus subtask berdasarkan ID.
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
