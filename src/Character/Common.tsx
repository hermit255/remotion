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

// Canvasベースのキャラクターコンポーネント
export function createCharacterCanvas<T extends Record<string, LayerMetadata>>(
  config: CharacterConfig<T>
): React.FC<CharacterCanvasProps> {
  const metaData: Metadata = metadataSchema.parse(config.metadataJson);
  const modMetaData = processMetadata(metaData, config.basePath) as T;
  const allLayers = collectAllLayers(modMetaData);

  // デフォルトの可視性を設定して、初期表示用のレイヤーを取得
  const getDefaultLayers = (): Array<{element: LayerMetadata, imagePath: string}> => {
    allLayers.forEach(({ layer }: {layer: LayerMetadata, parentIndex: number, parentIndices: number[]}) => {
      layer.visible = false;
    });
    config.setDefaultVisibility(modMetaData, allLayers);
    return getVisibleLayersSorted(allLayers);
  };

  // 初期表示用のレイヤーを取得（コンポーネント外で一度だけ実行）
  const defaultLayers = getDefaultLayers();
  
  // 初期表示用の画像を事前にプリロード
  if (typeof window !== 'undefined') {
    defaultLayers.forEach(({ imagePath }) => {
      const img = new Image();
      img.src = imagePath;
    });
  }

  return (props: CharacterCanvasProps) => {
    const frame = useCurrentFrame();
    const { lipSync, emotion, pose, flipHorizontal, style, className, ...domProps } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isInitializedRef = useRef(false);

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
    // 初期描画時はdefaultLayersを使用、それ以外はimageMetadataを使用
    const canvasSize = useMemo(() => {
      const layersToUse = imageMetadata.length > 0 ? imageMetadata : defaultLayers;
      return calculateCanvasSize(layersToUse);
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
      if (!canvas) return;

      // 最初のフレームで初期表示用のレイヤーを描画
      if (!isInitializedRef.current && defaultLayers.length > 0) {
        isInitializedRef.current = true;
        renderLayersToCanvas(canvas, defaultLayers)
          .catch((error: unknown) => {
            console.error('Error loading initial images for character:', error);
          });
      }

      // imageMetadataが空の場合は描画しない
      if (imageMetadata.length === 0) return;

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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

// エクスポート用のヘルパー関数
export { setLayerVisibility };
