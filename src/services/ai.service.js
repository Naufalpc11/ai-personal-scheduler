const prisma = require("../prisma/client");

const toDateOnly = (value) => {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const handleAiResult = async (userId, payload) => {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        userId,
        title: payload.title,
        description: payload.description || null,
        status: payload.status || "pending",
      },
    });

    if (payload.subtasks && payload.subtasks.length > 0) {
      await tx.subtask.createMany({
        data: payload.subtasks.map((title) => ({
          taskId: task.id,
          title,
          isCompleted: false,
        })),
      });
    }

    if (payload.schedule && payload.schedule.length > 0) {
      await tx.schedule.createMany({
        data: payload.schedule.map((item) => ({
          taskId: task.id,
          startTime: new Date(item.startTime),
          endTime: new Date(item.endTime),
          date: item.date ? new Date(item.date) : toDateOnly(item.startTime),
        })),
      });
    }

    const fullTask = await tx.task.findUnique({
      where: { id: task.id },
      include: {
        subtasks: true,
        schedules: true,
      },
    });

    return fullTask;
  });
};

module.exports = {
  handleAiResult,
};
