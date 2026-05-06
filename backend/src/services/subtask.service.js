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

const ensureTaskOwnership = async (userId, taskId) => {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("id")
    .eq("id", taskId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Task not found", 404);
  }

  return data;
};

const resolveStatus = (payload) => {
  if (payload.status) {
    return payload.status;
  }
  if (payload.isCompleted !== undefined) {
    return payload.isCompleted ? "done" : "pending";
  }
  return "pending";
};

const createSubtask = async (userId, taskId, payload) => {
  await ensureTaskOwnership(userId, taskId);

  const { data, error } = await supabaseAdmin
    .from("subtasks")
    .insert({
      task_id: taskId,
      subtask_title: payload.title,
      estimated_minutes: payload.estimatedMinutes ?? null,
      is_ai_generated: payload.isAiGenerated ?? false,
      order_index: payload.orderIndex ?? null,
      description: payload.description ?? null,
      status: resolveStatus(payload),
      due_date: payload.dueDate ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return mapSubtask(data);
};

const getSubtasksByTask = async (userId, taskId) => {
  await ensureTaskOwnership(userId, taskId);

  const { data, error } = await supabaseAdmin
    .from("subtasks")
    .select("*")
    .eq("task_id", taskId)
    .order("order_index", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data.map(mapSubtask);
};

const updateSubtask = async (userId, subtaskId, payload) => {
  const { data: subtask, error: findError } = await supabaseAdmin
    .from("subtasks")
    .select("id, task_id")
    .eq("id", subtaskId)
    .maybeSingle();

  if (findError) {
    throw new AppError(findError.message, 500);
  }

  if (!subtask) {
    throw new AppError("Subtask not found", 404);
  }

  await ensureTaskOwnership(userId, subtask.task_id);

  const updatePayload = {};
  if (payload.title !== undefined) updatePayload.subtask_title = payload.title;
  if (payload.estimatedMinutes !== undefined) updatePayload.estimated_minutes = payload.estimatedMinutes;
  if (payload.isAiGenerated !== undefined) updatePayload.is_ai_generated = payload.isAiGenerated;
  if (payload.orderIndex !== undefined) updatePayload.order_index = payload.orderIndex;
  if (payload.description !== undefined) updatePayload.description = payload.description;
  if (payload.status !== undefined || payload.isCompleted !== undefined) {
    updatePayload.status = resolveStatus(payload);
  }
  if (payload.dueDate !== undefined) updatePayload.due_date = payload.dueDate;

  const { data, error } = await supabaseAdmin
    .from("subtasks")
    .update(updatePayload)
    .eq("id", subtaskId)
    .select("*")
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return mapSubtask(data);
};

const deleteSubtask = async (userId, subtaskId) => {
  const { data: subtask, error: findError } = await supabaseAdmin
    .from("subtasks")
    .select("id, task_id")
    .eq("id", subtaskId)
    .maybeSingle();

  if (findError) {
    throw new AppError(findError.message, 500);
  }

  if (!subtask) {
    throw new AppError("Subtask not found", 404);
  }

  await ensureTaskOwnership(userId, subtask.task_id);

  const { error } = await supabaseAdmin.from("subtasks").delete().eq("id", subtaskId);

  if (error) {
    throw new AppError(error.message, 400);
  }
};

module.exports = {
  createSubtask,
  getSubtasksByTask,
  updateSubtask,
  deleteSubtask,
};
