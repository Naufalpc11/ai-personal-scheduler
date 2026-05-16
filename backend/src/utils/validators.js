const { z } = require("zod");

/**
 * Normalize ISO 8601 datetime strings by fixing invalid hour 24 to next day 00:00.
 * Example: "2026-05-17T24:00:00+08:00" → "2026-05-18T00:00:00+08:00"
 */
const normalizeDatetime = (isoString) => {
  if (!isoString || typeof isoString !== "string") {
    return isoString;
  }

  const match = isoString.match(/^(\d{4}-\d{2}-\d{2})T24:(\d{2}:\d{2}(?:\.\d+)?)(.*)$/);
  if (!match) {
    return isoString;
  }

  const [, dateStr, timeWithoutHour, timezone] = match;
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  const nextDateStr = date.toISOString().split("T")[0];
  return `${nextDateStr}T00:${timeWithoutHour}${timezone}`;
};

/**
 * Normalize a schedule plan array by fixing any 24:00 times.
 */
const normalizeSchedulePlan = (schedulePlan) => {
  if (!Array.isArray(schedulePlan)) {
    return schedulePlan;
  }

  return schedulePlan.map((item) => {
    const startTime = normalizeDatetime(item.startTime);
    let endTime = normalizeDatetime(item.endTime);
    const date = normalizeDatetime(item.date);

    // If both times are parseable and endTime is not after startTime,
    // assume the end is on the next day and add 1 day to endTime.
    try {
      if (startTime && endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end.getTime() <= start.getTime()) {
          const newEnd = new Date(end);
          newEnd.setDate(newEnd.getDate() + 1);
          endTime = newEnd.toISOString();
        }
      }
    } catch (e) {
      // ignore and return original strings if parsing fails
    }

    return {
      ...item,
      startTime,
      endTime,
      date,
    };
  });
};

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  }),
  params: z.object({}),
  query: z.object({}),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  params: z.object({}),
  query: z.object({}),
});

const taskBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "done"]).optional(),
  dueDate: z.string().optional(),
  aiGenerated: z.boolean().optional(),
});

const createTaskSchema = z.object({
  body: taskBodySchema,
  params: z.object({}),
  query: z.object({}),
});

const getTaskByIdSchema = z.object({
  body: z.object({}),
  params: idParamSchema,
  query: z.object({}),
});

const updateTaskSchema = z.object({
  body: taskBodySchema.partial().refine(
    (value) => Object.keys(value).length > 0,
    "At least one field is required"
  ),
  params: idParamSchema,
  query: z.object({}),
});

const taskIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createSubtaskSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    estimatedMinutes: z.coerce.number().int().positive().optional(),
    isAiGenerated: z.boolean().optional(),
    orderIndex: z.coerce.number().int().positive().optional(),
    description: z.string().optional(),
    status: z.enum(["pending", "in_progress", "done"]).optional(),
    dueDate: z.string().optional(),
    isCompleted: z.boolean().optional(),
  }),
  params: taskIdParamSchema,
  query: z.object({}),
});

const getSubtaskByTaskSchema = z.object({
  body: z.object({}),
  params: taskIdParamSchema,
  query: z.object({}),
});

const updateSubtaskSchema = z.object({
  body: z
    .object({
      title: z.string().min(1).optional(),
      estimatedMinutes: z.coerce.number().int().positive().optional(),
      isAiGenerated: z.boolean().optional(),
      orderIndex: z.coerce.number().int().positive().optional(),
      description: z.string().optional(),
      status: z.enum(["pending", "in_progress", "done"]).optional(),
      dueDate: z.string().optional(),
      isCompleted: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "At least one field is required"),
  params: idParamSchema,
  query: z.object({}),
});

const createScheduleSchema = z.object({
  body: z
    .object({
      taskId: z.coerce.number().int().positive(),
      startTime: z.string().datetime(),
      endTime: z.string().datetime(),
      status: z.enum(["pending", "in_progress", "done"]).optional(),
      isAutoScheduled: z.boolean().optional(),
      isRescheduled: z.boolean().optional(),
      rescheduleReason: z.string().optional(),
    })
    .refine((value) => new Date(value.endTime) > new Date(value.startTime), {
      message: "endTime must be greater than startTime",
      path: ["endTime"],
    }),
  params: z.object({}),
  query: z.object({}),
});

const updateScheduleSchema = z.object({
  body: z
    .object({
      taskId: z.coerce.number().int().positive().optional(),
      startTime: z.string().datetime().optional(),
      endTime: z.string().datetime().optional(),
      status: z.enum(["pending", "in_progress", "done"]).optional(),
      isAutoScheduled: z.boolean().optional(),
      isRescheduled: z.boolean().optional(),
      rescheduleReason: z.string().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "At least one field is required")
    .refine(
      (value) => {
        if (!value.startTime || !value.endTime) {
          return true;
        }
        return new Date(value.endTime) > new Date(value.startTime);
      },
      {
        message: "endTime must be greater than startTime",
        path: ["endTime"],
      }
    ),
  params: idParamSchema,
  query: z.object({}),
});

const aiResultSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(["pending", "in_progress", "done"]).optional(),
    subtasks: z.array(z.string().min(1)).default([]),
    schedule: z
      .array(
        z
          .object({
            startTime: z.string().datetime(),
            endTime: z.string().datetime(),
            date: z.string().datetime().optional(),
          })
          .refine((value) => new Date(value.endTime) > new Date(value.startTime), {
            message: "endTime must be greater than startTime",
            path: ["endTime"],
          })
      )
      .default([]),
  }),
  params: z.object({}),
  query: z.object({}),
});

// Pilihan provider untuk endpoint AI generate/execute (mode Gemini-only).
const aiProviderSchema = z.enum(["auto", "gemini"]);

// Request schema for generate/execute AI planning pipeline.
const aiGenerateSchema = z.object({
  body: z.object({
    userRequest: z.string().min(1),
    taskId: z.coerce.number().int().positive().optional(),
    intent: z.enum(["create_task", "add_subtasks", "auto_schedule", "reschedule", "recommend"]).optional(),
    provider: aiProviderSchema.optional().default("auto"),
    locale: z.string().min(2).optional().default("id-ID"),
    timezone: z.string().min(1).optional().default("Asia/Jakarta"),
    temperature: z.number().min(0).max(1).optional(),
    maxAttempts: z.coerce.number().int().min(1).max(5).optional(),
    context: z
      .object({
        currentDate: z.string().datetime().optional(),
        notes: z.string().optional(),
        existingTasks: z
          .array(
            z.object({
              title: z.string().min(1),
              status: z.enum(["pending", "in_progress", "done"]).optional(),
            })
          )
          .optional(),
        fixedEvents: z
          .array(
            z.object({
              title: z.string().min(1),
              startTime: z.string().datetime(),
              endTime: z.string().datetime(),
            })
          )
          .optional(),
      })
      .strict()
      .optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

module.exports = {
  registerSchema,
  loginSchema,
  createTaskSchema,
  getTaskByIdSchema,
  updateTaskSchema,
  createSubtaskSchema,
  getSubtaskByTaskSchema,
  updateSubtaskSchema,
  createScheduleSchema,
  updateScheduleSchema,
  aiResultSchema,
  aiGenerateSchema,
  aiProviderSchema,
  normalizeSchedulePlan,
  normalizeDatetime,
};
