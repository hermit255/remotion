import { z } from "zod";
import { staticFile } from "remotion";

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

// metadata.jsonのレイヤーををkey:valueオブジェクトに変換する関数
const setKey = (children: LayerMetadata[]): Record<string, LayerMetadata> => 
  Object.fromEntries(children.map((value: LayerMetadata) => {
    const name = value.name.replace(/^[!*]/, '');
    // オブジェクトをコピーしてから使用（参照を共有しないようにする）
    // childrenは後でオブジェクトに置き換えられるが、再帰処理で参照するため保持する
    const copied = { ...value, name };
    return [name, copied];
  }));

// childrenを再帰的に処理して、imagePathを設定する関数
const processChildrenRecursively = (
  children: LayerMetadata[],
  childrenObj: Record<string, LayerMetadata>,
  pathSegments: string[],
  basePath: string
): void => {
  if (!Array.isArray(children)) {
    return;
  }
  
  children.forEach((child: LayerMetadata) => {
    const childName = child.name.replace(/^[!*]/, '');
    const currentPath = [...pathSegments, childName];
    
    // childrenObj[childName]は元のchildオブジェクトへの参照なので、直接変更する
    const childObj = (childrenObj as any)[childName];
    if (!childObj) {
      return;
    }
    childObj.name = childName;
    
    // まず、childrenがない場合（画像ファイル）のimagePathを設定
    if (!child.children || !Array.isArray(child.children)) {
      if (!child.is_group) {
        childObj.imagePath = staticFile(
          basePath + currentPath.join("/") + ".png"
        ) as string;
      }
      return;
    }
    
    // childrenがある場合、再帰的に処理
    // まず、childrenをsetKeyでkey:value化する
    const grandChildrenObj = setKey(child.children);
    // grandChildrenObjの各要素のnameも記号なしに更新
    Object.keys(grandChildrenObj).forEach((key) => {
      const grandChildObj = grandChildrenObj[key];
      if (grandChildObj) {
        grandChildObj.name = key;
      }
    });
    // childrenプロパティを確実にオブジェクトに置き換える
    childObj.children = grandChildrenObj;
    // 再帰的に処理（元の配列child.childrenを渡し、各階層でsetKeyが適用される）
    processChildrenRecursively(child.children, grandChildrenObj, currentPath, basePath);
    
    // グループでも画像ファイルとして扱う場合（必要に応じて）
    if (!child.is_group) {
      childObj.imagePath = staticFile(
        basePath + currentPath.join("/") + ".png"
      ) as string;
    }
  });
};

// metaDataを処理して、Record<string, LayerMetadata>形式に変換する関数
export const processMetadata = (
  metaData: Metadata,
  basePath: string
): Record<string, LayerMetadata> => {
  return metaData.reduce((acc, part) => {
    // part.nameから記号を取り除く
    const partName = part.name.replace(/^[!*]/, '');
    // partをコピーしてから使用（参照を共有しないようにする）
    // childrenは後でオブジェクトに置き換えるので、一旦undefinedにする
    const partCopy = { ...part, name: partName, children: undefined as any };
    acc[partName] = partCopy;
    if (part.children && Array.isArray(part.children)) {
      const childrenObj = setKey(part.children);
      // childrenを確実にオブジェクトに置き換える
      partCopy.children = childrenObj as any;
      // 再帰的にchildrenを処理
      processChildrenRecursively(part.children, childrenObj, [partName], basePath);
    } else {
      // childrenがない場合（画像ファイル）のimagePathを設定
      if (!part.is_group) {
        partCopy.imagePath = staticFile(
          basePath + partName + ".png"
        ) as string;
      }
    }
    return acc;
  }, {} as Record<string, LayerMetadata>);
};
