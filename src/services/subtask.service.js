const prisma = require("../prisma/client");
const AppError = require("../utils/appError");

const ensureTaskOwnership = async (userId, taskId) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return task;
};

const createSubtask = async (userId, taskId, payload) => {
  await ensureTaskOwnership(userId, taskId);

  return prisma.subtask.create({
    data: {
      taskId,
      title: payload.title,
      isCompleted: payload.isCompleted || false,
    },
  });
};

const getSubtasksByTask = async (userId, taskId) => {
  await ensureTaskOwnership(userId, taskId);

  return prisma.subtask.findMany({
    where: { taskId },
    orderBy: { id: "asc" },
  });
};

const updateSubtask = async (userId, subtaskId, payload) => {
  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    include: { task: true },
  });

  if (!subtask || subtask.task.userId !== userId) {
    throw new AppError("Subtask not found", 404);
  }

  return prisma.subtask.update({
    where: { id: subtaskId },
    data: {
      title: payload.title,
      isCompleted: payload.isCompleted,
    },
  });
};

const deleteSubtask = async (userId, subtaskId) => {
  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    include: { task: true },
  });

  if (!subtask || subtask.task.userId !== userId) {
    throw new AppError("Subtask not found", 404);
  }

  await prisma.subtask.delete({ where: { id: subtaskId } });
};

module.exports = {
  createSubtask,
  getSubtasksByTask,
  updateSubtask,
  deleteSubtask,
};
