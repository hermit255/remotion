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

// metaData(json)を処理して、Record<string, LayerMetadata>形式に変換する関数
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

// Metadataを再帰的に走査して、すべてのレイヤーを取得する関数
// 親レイヤーのindexも保持して、描画順序を決定する
export const collectAllLayers = (
  metadata: Record<string, LayerMetadata>
): Array<{layer: LayerMetadata, parentIndex: number}> => {
  const layers: Array<{layer: LayerMetadata, parentIndex: number}> = [];
  
  const traverse = (layer: LayerMetadata, parentIndex: number) => {
    // 画像ファイル（is_group=false かつ imagePathがある）の場合のみ追加
    if (!layer.is_group && (layer as any).imagePath) {
      layers.push({ layer, parentIndex });
    }
    
    // childrenがある場合は再帰的に処理
    if (layer.children && typeof layer.children === 'object') {
      Object.values(layer.children).forEach((child) => {
        traverse(child, layer.index);
      });
    }
  };
  
  Object.values(metadata).forEach((layer) => {
    traverse(layer, -1); // ルートレイヤーの親indexは-1
  });
  
  return layers;
};

// レイヤー配列からcanvasサイズを計算する関数
export const calculateCanvasSize = (
  layers: Array<{element: LayerMetadata, imagePath: string}>
): { width: number; height: number } => {
  let maxWidth = 0;
  let maxHeight = 0;
  layers.forEach(({ element }) => {
    const right = element.left + element.width;
    const bottom = element.top + element.height;
    maxWidth = Math.max(maxWidth, right);
    maxHeight = Math.max(maxHeight, bottom);
  });
  return { width: maxWidth, height: maxHeight };
};

// visible=trueのレイヤーを取得し、描画順序でソートする関数
export const getVisibleLayersSorted = (
  allLayers: Array<{layer: LayerMetadata, parentIndex: number}>
): Array<{element: LayerMetadata, imagePath: string}> => {
  return allLayers
    .filter(({ layer }) => layer.visible === true)
    .map(({ layer, parentIndex }) => {
      const imagePath = (layer as any).imagePath;
      return { element: layer, imagePath, parentIndex };
    })
    .filter((item): item is {element: LayerMetadata, imagePath: string, parentIndex: number} => 
      item.imagePath !== undefined && item.imagePath !== null
    )
    .sort((a, b) => {
      // 親indexと子indexを組み合わせてソート（Photoshopと同じ描画順序）
      // export_layers.pyでreverse()が使われているため、エクスポートされたJSONでは
      // index 0が一番上に表示されるレイヤー、indexが大きいものが下に表示されるレイヤー
      // canvasは先に描画したものが下に、後に描画したものが上に表示されるため、
      // indexが大きい順（下のレイヤーから）に描画する
      if (a.parentIndex !== b.parentIndex) {
        return b.parentIndex - a.parentIndex; // 親indexが大きい順
      }
      return b.element.index - a.element.index; // indexが大きい順（下のレイヤーから上へ描画）
    })
    .map(({ element, imagePath }) => ({ element, imagePath })); // parentIndexを削除
};

// 画像キャッシュ（パスをキーとして画像を保存）
const imageCache = new Map<string, HTMLImageElement>();
// 読み込み中のPromiseを保存（同じ画像の複数回読み込みを防ぐ）
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();

// 画像を読み込む関数（キャッシュを利用）
const loadImage = (imagePath: string): Promise<HTMLImageElement> => {
  // キャッシュに存在し、読み込み完了している場合は即座に返す
  const cached = imageCache.get(imagePath);
  if (cached && cached.complete) {
    return Promise.resolve(cached);
  }

  // 既に読み込み中の場合は、そのPromiseを返す
  const loadingPromise = loadingPromises.get(imagePath);
  if (loadingPromise) {
    return loadingPromise;
  }

  // 新しい読み込みを開始
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      imageCache.set(imagePath, img);
      loadingPromises.delete(imagePath);
      resolve(img);
    };
    img.onerror = (error) => {
      loadingPromises.delete(imagePath);
      console.error(`Failed to load image: ${imagePath}`, error);
      reject(error);
    };
    
    img.src = imagePath;
  });

  loadingPromises.set(imagePath, promise);
  return promise;
};

// canvasにレイヤーを描画する関数
export const renderLayersToCanvas = async (
  canvas: HTMLCanvasElement,
  layers: Array<{element: LayerMetadata, imagePath: string}>
): Promise<void> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2d context from canvas');
  }

  // 画像を読み込んで描画（キャッシュを利用）
  try {
    const images = await Promise.all(
      layers.map(({ imagePath }) => loadImage(imagePath))
    );

    // canvasをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 各画像を描画
    images.forEach((img, index) => {
      const { element } = layers[index];
      const x = element.left;
      const y = element.top;
      const width = element.width;
      const height = element.height;
      
      ctx.drawImage(img, x, y, width, height);
    });
  } catch (error) {
    console.error('Error loading images for canvas:', error);
    throw error;
  }
};
