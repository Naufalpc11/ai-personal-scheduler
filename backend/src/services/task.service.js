const AppError = require("../utils/appError");
const { supabaseAdmin } = require("../supabase/client");

const mapSubtask = (row) => ({
  id: row.id,
  taskId: row.task_id,
  title: row.subtask_title,
  estimatedMinutes: row.estimated_minutes,
  isAiGenerated: row.is_ai_generated,
  orderIndex: row.order_index,
  description: row.description,
  status: row.status,
  dueDate: row.due_date,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapSchedule = (row) => ({
  id: row.id,
  taskId: row.task_id,
  status: row.status,
  startTime: row.start_time,
  endTime: row.end_time,
  isAutoScheduled: row.is_auto_scheduled,
  isRescheduled: row.is_rescheduled,
  rescheduleReason: row.reschedule_reason,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapTask = (row) => ({
  id: row.id,
  userId: row.user_id,
  title: row.task_title,
  description: row.description,
  status: row.status,
  dueDate: row.due_date,
  aiGenerated: row.ai_generated,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  subtasks: Array.isArray(row.subtasks) ? row.subtasks.map(mapSubtask) : undefined,
  schedules: Array.isArray(row.schedules) ? row.schedules.map(mapSchedule) : undefined,
});

const createTask = async (userId, payload) => {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .insert({
      user_id: userId,
      task_title: payload.title,
      description: payload.description || null,
      status: payload.status || "pending",
      due_date: payload.dueDate || null,
      ai_generated: payload.aiGenerated || false,
    })
    .select("*")
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return mapTask(data);
};

const getTasks = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("*, subtasks(*), schedules(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data.map(mapTask);
};

const getTaskById = async (userId, id) => {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("*, subtasks(*), schedules(*)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Task not found", 404);
  }

  return mapTask(data);
};

const updateTask = async (userId, id, payload) => {
  const updatePayload = {};

  if (payload.title !== undefined) updatePayload.task_title = payload.title;
  if (payload.description !== undefined) updatePayload.description = payload.description;
  if (payload.status !== undefined) updatePayload.status = payload.status;
  if (payload.dueDate !== undefined) updatePayload.due_date = payload.dueDate;
  if (payload.aiGenerated !== undefined) updatePayload.ai_generated = payload.aiGenerated;

  const { error } = await supabaseAdmin
    .from("tasks")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new AppError(error.message, 400);
  }

  return getTaskById(userId, id);
};

const deleteTask = async (userId, id) => {
  await getTaskById(userId, id);

  const { error } = await supabaseAdmin.from("tasks").delete().eq("id", id).eq("user_id", userId);

  if (error) {
    throw new AppError(error.message, 400);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
