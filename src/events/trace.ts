import { z } from "zod";

const timestamp = z.number().int().nonnegative();
const place = z.enum(["ones", "tens"]);
const digit = z.number().int().min(0).max(9);

const borrowEventSchema = z.object({
  type: z.literal("borrow"),
  at: timestamp,
});

const digitEditEventSchema = z.object({
  type: z.literal("digit_edit"),
  at: timestamp,
  place,
  value: z.number().int().min(0).max(19),
});

const columnResultEventSchema = z.object({
  type: z.literal("column_result"),
  at: timestamp,
  place,
  value: digit,
});

const answerEventSchema = z.object({
  type: z.literal("answer"),
  at: timestamp,
  value: z.number().int(),
});

const hintEventSchema = z.object({
  type: z.literal("hint"),
  at: timestamp,
  level: z.union([z.literal(1), z.literal(2)]),
});

export const reasoningEventSchema = z.discriminatedUnion("type", [
  borrowEventSchema,
  digitEditEventSchema,
  columnResultEventSchema,
  answerEventSchema,
  hintEventSchema,
]);

export const reasoningTraceSchema = z
  .object({
    problemId: z.string().min(1),
    problem: z.object({
      minuend: z.number().int(),
      subtrahend: z.number().int(),
    }),
    events: z.array(reasoningEventSchema),
    finalAnswer: z.number().int(),
    startedAt: timestamp,
    completedAt: timestamp,
  })
  .refine((trace) => trace.completedAt >= trace.startedAt, {
    message: "A trace cannot complete before it started",
    path: ["completedAt"],
  });

export type ReasoningEvent = z.infer<typeof reasoningEventSchema>;
export type ReasoningTrace = z.infer<typeof reasoningTraceSchema>;
