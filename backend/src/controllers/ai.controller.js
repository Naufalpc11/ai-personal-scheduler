const asyncHandler = require("../utils/asyncHandler");
const aiService = require("../services/ai.service");
const AppError = require("../utils/appError");

const handleAiGenerate = asyncHandler(async (req, res) => {
  const { userRequest, taskId } = req.body;
  const userId = req.user.id;

  const result = await aiService.generateAiResult(userRequest, userId, { taskId });

  res.status(200).json({
    success: true,
    data: result,
  });
});

const taskService = require("../services/task.service");
const subtaskService = require("../services/subtask.service");
const scheduleService = require("../services/schedule.service");

const handleAiExecute = asyncHandler(async (req, res) => {
  const { userRequest, taskId } = req.body;
  const userId = req.user.id;

  // Generate AI result (this returns { output, provider, model })
  const result = await aiService.generateAiResult(userRequest, userId, { taskId });
  const output = result.output;

  // If out_of_scope, return without persisting
  if (!output || output.intent === "out_of_scope") {
    return res.status(200).json({ success: true, data: result });
  }

  // Persist main task
  if (!output.mainTask || !output.mainTask.title) {
    throw new AppError("AI did not return a valid mainTask to persist", 400);
  }

  const createdTask = await taskService.createTask(userId, {
    title: output.mainTask.title,
    description: output.mainTask.description || null,
    status: output.mainTask.status || "pending",
    dueDate: output.schedulingConstraints?.deadline || null,
    aiGenerated: true,
  });

  // Persist subtasks
  const createdSubtasks = [];
  if (Array.isArray(output.subtasks)) {
    for (let i = 0; i < output.subtasks.length; i++) {
      const st = output.subtasks[i];
      try {
        const created = await subtaskService.createSubtask(userId, createdTask.id, {
          title: st.title,
          estimatedMinutes: st.estimatedMinutes,
          orderIndex: st.order || i + 1,
          description: st.notes || null,
          isAiGenerated: true,
        });
        createdSubtasks.push(created);
      } catch (err) {
        // Log and continue
        console.error("Failed to create subtask:", err?.message || err);
      }
    }
  }

  // Persist schedulePlan
  const createdSchedules = [];
  if (Array.isArray(output.schedulePlan)) {
    for (const plan of output.schedulePlan) {
      try {
        const created = await scheduleService.createSchedule(userId, {
          taskId: createdTask.id,
          startTime: plan.startTime,
          endTime: plan.endTime,
          isAutoScheduled: true,
        });
        createdSchedules.push(created);
      } catch (err) {
        console.error("Failed to create schedule:", err?.message || err);
      }
    }
  }

  // Return created resources and AI output
  res.status(201).json({
    success: true,
    data: {
      ai: result,
      task: createdTask,
      subtasks: createdSubtasks,
      schedules: createdSchedules,
    },
  });
});

const handleAiResult = asyncHandler(async (_req, res) => {
  throw new AppError("AI result endpoint not yet implemented", 501);
});

module.exports = {
  handleAiGenerate,
  handleAiExecute,
  handleAiResult,
};
