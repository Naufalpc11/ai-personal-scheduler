const { z } = require("zod");

const dayEnum = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

const intentEnum = z.enum([
  "create_task",
  "add_subtasks",
  "auto_schedule",
  "reschedule",
  "recommend",
]);

const recommendationTypeEnum = z.enum(["next_action", "productivity_tip", "reminder"]);
const priorityEnum = z.enum(["low", "medium", "high"]);
const statusEnum = z.enum(["pending", "in_progress", "done"]);

const llmOutputSchema = z
  .object({
    version: z.string().default("1.0"),
    intent: intentEnum,
    userRequest: z.string().min(1),
    locale: z.string().min(2).default("id-ID"),
    timezone: z.string().min(1).default("Asia/Jakarta"),
    mainTask: z
      .object({
        title: z.string().min(3).max(120),
        description: z.string().max(500).nullable().optional(),
        priority: priorityEnum,
        status: statusEnum,
      })
      .optional(),
    subtasks: z
      .array(
        z.object({
          title: z.string().min(1).max(120),
          notes: z.string().max(300).nullable().optional(),
          order: z.coerce.number().int().min(1),
          estimatedMinutes: z.coerce.number().int().min(5).max(480),
          isFlexible: z.boolean(),
        })
      )
      .default([]),
    estimatedDurationPerSubtask: z
      .array(
        z.object({
          subtaskTitle: z.string().min(1),
          minutes: z.coerce.number().int().min(5).max(480),
          confidence: z.number().min(0).max(1),
        })
      )
      .default([]),
    schedulingConstraints: z
      .object({
        deadline: z.string().datetime().nullable().optional(),
        preferredTimeWindows: z
          .array(
            z.object({
              day: dayEnum,
              start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
              end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
            })
          )
          .default([]),
        fixedEvents: z
          .array(
            z.object({
              title: z.string().min(1).max(120),
              startTime: z.string().datetime(),
              endTime: z.string().datetime(),
            })
          )
          .default([]),
        maxDailyFocusMinutes: z.coerce.number().int().min(30).max(1440).default(240),
        allowWeekend: z.boolean().default(false),
      })
      .optional(),
    schedulePlan: z
      .array(
        z.object({
          subtaskTitle: z.string().min(1),
          startTime: z.string().datetime(),
          endTime: z.string().datetime(),
          date: z.string().datetime(),
          reason: z.string().min(1).max(300),
        })
      )
      .default([]),
    reschedulePlan: z
      .object({
        trigger: z.object({
          title: z.string().min(1).max(120),
          startTime: z.string().datetime(),
          endTime: z.string().datetime(),
        }),
        conflicts: z
          .array(
            z.object({
              subtaskTitle: z.string().min(1),
              oldStartTime: z.string().datetime(),
              oldEndTime: z.string().datetime(),
            })
          )
          .default([]),
        moves: z
          .array(
            z.object({
              subtaskTitle: z.string().min(1),
              newStartTime: z.string().datetime(),
              newEndTime: z.string().datetime(),
              reason: z.string().min(1).max(300),
            })
          )
          .default([]),
      })
      .optional(),
    recommendations: z
      .array(
        z.object({
          type: recommendationTypeEnum,
          message: z.string().min(1).max(300),
          priority: priorityEnum,
        })
      )
      .default([]),
    meta: z
      .object({
        model: z.string().min(1),
        generatedAt: z.string().datetime(),
        confidence: z.number().min(0).max(1),
        needsUserConfirmation: z.boolean().default(false),
        assumptions: z.array(z.string().min(1)).default([]),
      })
      .optional(),
  })
  .passthrough()
  .superRefine((value, context) => {
    const intent = value.intent;

    if (!value.mainTask && intent !== "recommend") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "mainTask is required for this intent",
        path: ["mainTask"],
      });
    }

    if ((intent === "create_task" || intent === "auto_schedule") && value.subtasks.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "subtasks must contain at least one item for this intent",
        path: ["subtasks"],
      });
    }

    if ((intent === "create_task" || intent === "auto_schedule" || intent === "reschedule") && !value.schedulingConstraints) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "schedulingConstraints is required for this intent",
        path: ["schedulingConstraints"],
      });
    }

    if ((intent === "create_task" || intent === "auto_schedule") && value.schedulePlan.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "schedulePlan is required for this intent",
        path: ["schedulePlan"],
      });
    }

    if (intent === "reschedule" && !value.reschedulePlan) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "reschedulePlan is required for reschedule intent",
        path: ["reschedulePlan"],
      });
    }

    if (intent === "recommend" && value.recommendations.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "recommendations is required for recommend intent",
        path: ["recommendations"],
      });
    }

    if (!value.meta) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "meta is required",
        path: ["meta"],
      });
    }
  });

const extractAssistantText = (response) => {
  if (typeof response === "string") {
    return response;
  }

  if (!response || typeof response !== "object") {
    return "";
  }

  if (typeof response.content === "string") {
    return response.content;
  }

  const openAiText = response?.choices?.[0]?.message?.content;
  if (typeof openAiText === "string") {
    return openAiText;
  }

  const geminiParts = response?.candidates?.[0]?.content?.parts;
  if (Array.isArray(geminiParts)) {
    return geminiParts
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("");
  }

  return "";
};

const stripCodeFences = (text) => {
  const trimmed = text.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
};

const parseLlmJson = (response) => {
  const rawText = stripCodeFences(extractAssistantText(response));

  if (!rawText) {
    throw new Error("AI response is empty");
  }

  try {
    return JSON.parse(rawText);
  } catch (_error) {
    const firstObject = rawText.match(/\{[\s\S]*\}/);
    if (firstObject) {
      return JSON.parse(firstObject[0]);
    }

    throw new Error("AI response is not valid JSON");
  }
};

const validateLlmOutput = (payload) => llmOutputSchema.parse(payload);

module.exports = {
  llmOutputSchema,
  parseLlmJson,
  validateLlmOutput,
};
