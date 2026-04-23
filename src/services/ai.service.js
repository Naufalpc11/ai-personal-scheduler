const prisma = require("../prisma/client");
const AppError = require("../utils/appError");
const { generateAiPlan } = require("../ai/ai-engine");

// Normalizes a date-time string to a UTC date-only value.
const toDateOnly = (value) => {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

// Persists task graph (task, subtasks, schedule) in a single transaction.
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

// Delegates to AI engine to produce validated planning output.
const generateAiResult = async (payload) => {
  return generateAiPlan(payload);
};

// Maps LLM contract output into the persistence payload shape.
const transformGeneratedPlanToPayload = (plan) => {
  const title = plan?.mainTask?.title || plan?.userRequest;

  if (!title) {
    throw new AppError("Generated plan is missing a task title", 400);
  }

  return {
    title,
    description: plan?.mainTask?.description || null,
    status: plan?.mainTask?.status || "pending",
    subtasks: Array.isArray(plan?.subtasks) ? plan.subtasks.map((item) => item.title) : [],
    schedule: Array.isArray(plan?.schedulePlan)
      ? plan.schedulePlan.map((item) => ({
          startTime: item.startTime,
          endTime: item.endTime,
          date: item.date,
        }))
      : [],
  };
};

// Executes generate + transform + persist in one service call.
const generateAndSaveAiResult = async (userId, payload) => {
  const generated = await generateAiPlan(payload);
  const persistablePayload = transformGeneratedPlanToPayload(generated.data);
  const savedTask = await handleAiResult(userId, persistablePayload);

  return {
    generated,
    savedTask,
  };
};

module.exports = {
  handleAiResult,
  generateAiResult,
  generateAndSaveAiResult,
  transformGeneratedPlanToPayload,
};
