import { z } from "zod";

// metadata.jsonのスキーマ定義（再帰的構造）
const layerMetadataSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string(),
    index: z.number(),
    left: z.number(),
    right: z.number(),
    top: z.number(),
    bottom: z.number(),
    height: z.number(),
    width: z.number(),
    opacity: z.number(),
    blend_mode: z.string(),
    visible: z.boolean(),
    is_group: z.boolean(),
    children: z.array(layerMetadataSchema).optional(),
  })
);

export const metadataSchema = z.array(layerMetadataSchema);

// TypeScript型としてもエクスポート
export type LayerMetadata = z.infer<typeof layerMetadataSchema>;
export type Metadata = z.infer<typeof metadataSchema>;
