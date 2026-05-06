const AppError = require("../utils/appError");
const { supabaseAdmin } = require("../supabase/client");

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
  task: row.tasks
    ? {
        id: row.tasks.id,
        title: row.tasks.task_title,
        status: row.tasks.status,
      }
    : undefined,
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

const createSchedule = async (userId, payload) => {
  await ensureTaskOwnership(userId, payload.taskId);

  const { data, error } = await supabaseAdmin
    .from("schedules")
    .insert({
      task_id: payload.taskId,
      status: payload.status || "pending",
      start_time: payload.startTime,
      end_time: payload.endTime,
      is_auto_scheduled: payload.isAutoScheduled ?? false,
      is_rescheduled: payload.isRescheduled ?? false,
      reschedule_reason: payload.rescheduleReason ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return mapSchedule(data);
};

const getSchedules = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("schedules")
    .select("*, tasks!inner(id, task_title, status, user_id)")
    .eq("tasks.user_id", userId)
    .order("start_time", { ascending: true });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data.map(mapSchedule);
};

const updateSchedule = async (userId, scheduleId, payload) => {
  const { data: schedule, error: findError } = await supabaseAdmin
    .from("schedules")
    .select("id, task_id")
    .eq("id", scheduleId)
    .maybeSingle();

  if (findError) {
    throw new AppError(findError.message, 500);
  }

  if (!schedule) {
    throw new AppError("Schedule not found", 404);
  }

  await ensureTaskOwnership(userId, schedule.task_id);

  if (payload.taskId) {
    await ensureTaskOwnership(userId, payload.taskId);
  }

  const updatePayload = {};
  if (payload.taskId !== undefined) updatePayload.task_id = payload.taskId;
  if (payload.status !== undefined) updatePayload.status = payload.status;
  if (payload.startTime !== undefined) updatePayload.start_time = payload.startTime;
  if (payload.endTime !== undefined) updatePayload.end_time = payload.endTime;
  if (payload.isAutoScheduled !== undefined) updatePayload.is_auto_scheduled = payload.isAutoScheduled;
  if (payload.isRescheduled !== undefined) updatePayload.is_rescheduled = payload.isRescheduled;
  if (payload.rescheduleReason !== undefined) updatePayload.reschedule_reason = payload.rescheduleReason;

  const { data, error } = await supabaseAdmin
    .from("schedules")
    .update(updatePayload)
    .eq("id", scheduleId)
    .select("*")
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return mapSchedule(data);
};

const deleteSchedule = async (userId, scheduleId) => {
  const { data: schedule, error: findError } = await supabaseAdmin
    .from("schedules")
    .select("id, task_id")
    .eq("id", scheduleId)
    .maybeSingle();

  if (findError) {
    throw new AppError(findError.message, 500);
  }

  if (!schedule) {
    throw new AppError("Schedule not found", 404);
  }

  await ensureTaskOwnership(userId, schedule.task_id);

  const { error } = await supabaseAdmin.from("schedules").delete().eq("id", scheduleId);

  if (error) {
    throw new AppError(error.message, 400);
  }
};

module.exports = {
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
};
