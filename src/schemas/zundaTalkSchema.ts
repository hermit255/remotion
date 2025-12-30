import React from "react";
import { z } from "zod";
import { talkSchema } from "./sequenceSchema";

// 各SequenceでのZundamonとMetanのスタイルを定義するスキーマ
// 一般的なCSSプロパティを受け入れる（キーは任意の文字列、値は文字列または数値）
export const characterStyleSchema = z.record(
  z.string(),
  z.union([z.string(), z.number()])
);


// TypeScript型としてもエクスポート
export type CharacterStyle = z.infer<typeof characterStyleSchema>;

export const zundaTalkSchema = z.object({
  talks: z.array(talkSchema).default([]),
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
