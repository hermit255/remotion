import React, { useMemo, useRef, useEffect } from "react";
import { useCurrentFrame } from "remotion";
import {
  metadataSchema,
  processMetadata,
  collectAllLayers,
  calculateCanvasSize,
  getVisibleLayersSorted,
  renderLayersToCanvas,
  type LayerMetadata,
  type Metadata,
} from "../util/Psd";

// レイヤーの可視性を設定するヘルパー関数
const setLayerVisibility = (
  layer: LayerMetadata | undefined,
  visible: boolean
): void => {
  if (layer) {
    layer.visible = visible;
  }
};

// キャラクター固有の設定を定義する型
export interface CharacterConfig<T extends Record<string, LayerMetadata>> {
  // メタデータJSONのパス（requireで読み込む）
  metadataJson: unknown;
  // 画像のベースパス
  basePath: string;
  // デフォルトの可視性を設定する関数
  setDefaultVisibility: (metadata: T, allLayers: Array<{layer: LayerMetadata, parentIndex: number}>) => void;
  // 目の状態を設定する関数（オプション）
  setEyeState?: (metadata: T, emotion: string | undefined) => void;
  // 口の状態を設定する関数（オプション）
  setMouthState?: (
    metadata: T,
    frame: number,
    lipSync: number | undefined
  ) => void;
  // その他の状態を設定する関数（オプション）
  setOtherState?: (
    metadata: T,
    emotion: string | undefined,
    pose: string | undefined
  ) => void;
}

// Canvasベースのキャラクターコンポーネント用のProps
export interface CharacterCanvasProps extends Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, 'style'> {
  style?: React.CSSProperties;
  emotion?: string;
  pose?: string;
  lipSync?: number;
  flipHorizontal?: boolean;
  className?: string;
}

// imgタグベースのキャラクターコンポーネント用のProps
export interface CharacterImageProps extends React.HTMLAttributes<HTMLDivElement> {
  style?: React.CSSProperties;
  emotion?: string;
  pose?: string;
  lipSync?: number;
  flipHorizontal?: boolean;
  className?: string;
  // imgタグ用のスケール
  scale?: number;
}

// Canvasベースのキャラクターコンポーネント
export function createCharacterCanvas<T extends Record<string, LayerMetadata>>(
  config: CharacterConfig<T>
): React.FC<CharacterCanvasProps> {
  const metaData: Metadata = metadataSchema.parse(config.metadataJson);
  const modMetaData = processMetadata(metaData, config.basePath) as T;
  const allLayers = collectAllLayers(modMetaData);

  return (props: CharacterCanvasProps) => {
    const frame = useCurrentFrame();
    const { lipSync, emotion, pose, flipHorizontal, style, className, ...domProps } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // visible=trueのレイヤーを取得（useMemoでメモ化）
    const imageMetadata = useMemo((): Array<{element: LayerMetadata, imagePath: string}> => {
      // すべてのレイヤーを一旦非表示にする
      allLayers.forEach(({ layer }: {layer: LayerMetadata, parentIndex: number, parentIndices: number[]}) => {
        layer.visible = false;
      });

      // デフォルトのvisible状態を設定
      config.setDefaultVisibility(modMetaData, allLayers);

      // emotionに応じて目のレイヤーを変更
      if (config.setEyeState) {
        config.setEyeState(modMetaData, emotion);
      }

      // lipsyncが数値なら口パクを行う
      if (config.setMouthState) {
        config.setMouthState(modMetaData, frame, lipSync);
      }

      // その他の状態を設定
      if (config.setOtherState) {
        config.setOtherState(modMetaData, emotion, pose);
      }

      // visible=trueのレイヤーだけを取得し、indexでソート（Photoshopと同じ描画順序）
      return getVisibleLayersSorted(allLayers);
    }, [emotion, pose, lipSync, frame]);

    // canvasのサイズを計算（useMemoでメモ化）
    const canvasSize = useMemo(() => {
      return calculateCanvasSize(imageMetadata);
    }, [imageMetadata]);

    // canvasのサイズを初期設定
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (canvasSize.width > 0 && canvasSize.height > 0) {
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
      }
    }, [canvasSize]);

    // canvasに画像を描画
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || imageMetadata.length === 0) return;

      let cancelled = false;
      renderLayersToCanvas(canvas, imageMetadata)
        .catch((error: unknown) => {
          if (!cancelled) {
            console.error('Error loading images for character:', error);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [imageMetadata]);

    const containerStyle: React.CSSProperties = useMemo(() => ({
      ...style,
      ...(flipHorizontal && {
        transform: style?.transform
          ? `${style.transform} scaleX(-1)`
          : 'scaleX(-1)',
      }),
    }), [style, flipHorizontal]);

    const displayWidth = canvasSize.width;
    const displayHeight = canvasSize.height;

    return (
      <canvas
        className={className}
        ref={canvasRef}
        {...domProps}
        style={{
          display: 'block',
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          ...containerStyle
        }}
      />
    );
  };
}

// imgタグベースのキャラクターコンポーネント
export function createCharacterImage<T extends Record<string, LayerMetadata>>(
  config: CharacterConfig<T>
): React.FC<CharacterImageProps> {
  const metaData: Metadata = metadataSchema.parse(config.metadataJson);
  const modMetaData = processMetadata(metaData, config.basePath) as T;
  const allLayers = collectAllLayers(modMetaData);

  return (props: CharacterImageProps) => {
    const frame = useCurrentFrame();
    const { lipSync, emotion, pose, flipHorizontal, style, className, scale = 1, ...domProps } = props;

    // stateの各要素をdomとして出力する関数（useMemoでメモ化）
    const images = useMemo((): React.JSX.Element[] => {
      const partsStyleBase: React.CSSProperties = {
        position: 'absolute',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      };
      // すべてのレイヤーを一旦非表示にする
      allLayers.forEach(({ layer }: {layer: LayerMetadata, parentIndex: number, parentIndices: number[]}) => {
        layer.visible = false;
      });

      // デフォルトのvisible状態を設定
      config.setDefaultVisibility(modMetaData, allLayers);

      // emotionに応じて目のレイヤーを変更
      if (config.setEyeState) {
        config.setEyeState(modMetaData, emotion);
      }

      // lipsyncが数値なら口パクを行う
      if (config.setMouthState) {
        config.setMouthState(modMetaData, frame, lipSync);
      }

      // その他の状態を設定
      if (config.setOtherState) {
        config.setOtherState(modMetaData, emotion, pose);
      }

      // visible=trueのレイヤーだけを取得し、indexでソート
      // indexが小さいほど上層に表示される
      // 子のindexは親のindexの10分の1で計算（すべての親のindexを階層的に考慮）
      const visibleLayers = allLayers
        .filter(({ layer }) => layer.visible === true)
        .map(({ layer, parentIndex, parentIndices }) => {
          const imagePath = (layer as any).imagePath;
          return { element: layer, imagePath, parentIndex, parentIndices };
        })
        .filter((item): item is {element: LayerMetadata, imagePath: string, parentIndex: number, parentIndices: number[]} => 
          item.imagePath !== undefined && item.imagePath !== null
        )
        .sort((a, b) => {
          // すべての親のindexを階層的に考慮して計算
          // parentIndicesは[最上位親, 2番目の親, ...]の順序
          // 計算: 最上位親 + 2番目の親/10 + 3番目の親/100 + ... + 自分のindex/10^(階層数+1)
          const calculateCombinedIndex = (parentIndices: number[], parentIndex: number, elementIndex: number): number => {
            if (parentIndex === -1) {
              // トップレベルレイヤー
              return elementIndex;
            }
            // すべての親のindexを階層的に加算
            let combined = 0;
            let divisor = 1;
            for (let i = parentIndices.length - 1; i >= 0; i--) {
              combined += parentIndices[i] / divisor;
              divisor *= 10;
            }
            // 直接の親のindex
            combined += parentIndex / divisor;
            divisor *= 10;
            // 自分のindex
            combined += elementIndex / divisor;
            return combined;
          };
          
          const aCombinedIndex = calculateCombinedIndex(a.parentIndices, a.parentIndex, a.element.index);
          const bCombinedIndex = calculateCombinedIndex(b.parentIndices, b.parentIndex, b.element.index);
          
          // indexが大きい順（下から上）にソート（描画順を逆転）
          return bCombinedIndex - aCombinedIndex;
        })
        .map(({ element, imagePath }) => ({ element, imagePath }));

      return visibleLayers
        .map(({ element, imagePath }: {element: LayerMetadata, imagePath: string}, index: number) => {
          if (!imagePath) return null;

          return (
            <img
              key={index}
              src={imagePath}
              alt={element.name}
              style={{
                ...partsStyleBase,
                top: `${element.top * scale}px`,
                left: `${element.left * scale}px`,
              }}
            />
          );
        })
        .filter((element: React.JSX.Element | null): element is React.JSX.Element => element !== null);
    }, [emotion, pose, lipSync, frame, scale]);

    const containerStyle: React.CSSProperties = {
      ...style,
      ...(flipHorizontal && {
        transform: style?.transform
          ? `${style.transform} scaleX(-1)`
          : 'scaleX(-1)',
      }),
    };

    return (
      <div className={className} {...domProps} style={containerStyle}>
        {images}
      </div>
    );
  };
}

// エクスポート用のヘルパー関数
export { setLayerVisibility };
