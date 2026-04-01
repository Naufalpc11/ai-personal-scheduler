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

const toDateOnly = (value) => {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const createSchedule = async (userId, payload) => {
  await ensureTaskOwnership(userId, payload.taskId);

  return prisma.schedule.create({
    data: {
      taskId: payload.taskId,
      startTime: new Date(payload.startTime),
      endTime: new Date(payload.endTime),
      date: payload.date ? new Date(payload.date) : toDateOnly(payload.startTime),
    },
  });
};

const getSchedules = async (userId) => {
  return prisma.schedule.findMany({
    where: {
      task: {
        userId,
      },
    },
    orderBy: {
      startTime: "asc",
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });
};

const updateSchedule = async (userId, scheduleId, payload) => {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: { task: true },
  });

  if (!schedule || schedule.task.userId !== userId) {
    throw new AppError("Schedule not found", 404);
  }

  if (payload.taskId) {
    await ensureTaskOwnership(userId, payload.taskId);
  }

  const startTime = payload.startTime ? new Date(payload.startTime) : schedule.startTime;

  return prisma.schedule.update({
    where: { id: scheduleId },
    data: {
      taskId: payload.taskId,
      startTime,
      endTime: payload.endTime ? new Date(payload.endTime) : undefined,
      date: payload.date ? new Date(payload.date) : toDateOnly(startTime),
    },
  });
};

const deleteSchedule = async (userId, scheduleId) => {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: { task: true },
  });

  if (!schedule || schedule.task.userId !== userId) {
    throw new AppError("Schedule not found", 404);
  }

  await prisma.schedule.delete({ where: { id: scheduleId } });
};

module.exports = {
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
};
