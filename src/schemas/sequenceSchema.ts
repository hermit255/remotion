import { z } from "zod";

export const messageSchema = z.object({
  key: z.string(),
  fileName: z.string(),
  voice: z.number(),
  text: z.string(),
  intervalFrame: z.number().optional(),
});

export const scenarioSchema = z.object({
  title: z.string(),
  description: z.string(),
  messages: z.array(messageSchema),
});

export const talkSchema = z.object({
  key: z.string(),
  voice: z.number(),
  src: z.string(),
  intervalFrame: z.number().optional(),
  audioDurationInFrames: z.number(),
  durationInFrames: z.number().optional(),
  from: z.number().optional(),
  text: z.string(),
  emotion: z.string().optional(),
});

// TypeScript型としてもエクスポート
export type Message = z.infer<typeof messageSchema>;
export type Talk = z.infer<typeof talkSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;

