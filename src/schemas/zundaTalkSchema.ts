import React from "react";
import { z } from "zod";
import { messageSchema } from "./sequenceSchema";

// 各SequenceでのZundamonとMetanのスタイルを定義するスキーマ
export const characterStyleSchema = z.object({
  position: z.string().optional(),
  bottom: z.union([z.string(), z.number()]).optional(),
  left: z.union([z.string(), z.number()]).optional(),
  right: z.union([z.string(), z.number()]).optional(),
  height: z.union([z.string(), z.number()]).optional(),
  filter: z.string().optional(),
  opacity: z.number().optional(),
  transform: z.string().optional(),
});

// TypeScript型としてもエクスポート
export type CharacterStyle = z.infer<typeof characterStyleSchema>;

export const zundaTalkSchema = z.object({
  messages: z.array(messageSchema),
  style: z.record(
    z.string(),
    z.record(z.string(), characterStyleSchema)
  ).optional(),
  backgroundImagePath: z.string().optional(),
  bgmPath: z.string().optional(),
});

// TypeScript型としてもエクスポート
export type ZundaTalkProps = z.infer<typeof zundaTalkSchema> & {
  children?: React.ReactNode;
};
