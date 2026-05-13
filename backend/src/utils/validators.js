const { z } = require("zod");

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

// Pilihan provider untuk endpoint AI generate/execute (mode Ollama-only).
const aiProviderSchema = z.enum(["auto", "ollama"]);

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
};
