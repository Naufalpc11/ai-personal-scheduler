const prisma = require("../prisma/client");
const AppError = require("../utils/appError");

const createTask = async (userId, payload) => {
  return prisma.task.create({
    data: {
      userId,
      title: payload.title,
      description: payload.description,
      status: payload.status || "pending",
    },
  });
};

const getTasks = async (userId) => {
  return prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      subtasks: true,
      schedules: true,
    },
  });
};

const getTaskById = async (userId, id) => {
  const task = await prisma.task.findFirst({
    where: { id, userId },
    include: {
      subtasks: true,
      schedules: true,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return task;
};

const updateTask = async (userId, id, payload) => {
  await getTaskById(userId, id);

  return prisma.task.update({
    where: { id },
    data: {
      title: payload.title,
      description: payload.description,
      status: payload.status,
    },
  });
};

const deleteTask = async (userId, id) => {
  await getTaskById(userId, id);

  await prisma.task.delete({ where: { id } });
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
