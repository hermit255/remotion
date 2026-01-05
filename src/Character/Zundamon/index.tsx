import React, { useMemo, useRef, useEffect } from "react";
import {
  useCurrentFrame,
} from "remotion";
import { 
  metadataSchema, 
  processMetadata, 
  collectAllLayers,
  calculateCanvasSize,
  getVisibleLayersSorted,
  renderLayersToCanvas,
  type LayerMetadata, 
  type Metadata 
} from "../../util/Psd";
import type { ZundamonMetadata } from "./types";
import { applyLipsync } from "../lipsync";

const basePath = "img/characters/Zundamon/";
const metadataJson = require("./metadata.json");
const metaData: Metadata = metadataSchema.parse(metadataJson);

// metaDataの各要素およびchildrenに対してconvertChildrenを再帰的に適用
const modMetaData = processMetadata(metaData, basePath) as ZundamonMetadata;

// すべてのレイヤーを取得
const allLayers = collectAllLayers(modMetaData);

// レイヤーの可視性を設定するヘルパー関数
const setLayerVisibility = (
  layer: LayerMetadata | undefined,
  visible: boolean
): void => {
  if (layer) {
    layer.visible = visible;
  }
};

// デフォルトのvisible状態を設定する関数
const setDefaultVisibility = (): void => {
  // すべてのレイヤーを一旦非表示にする
  allLayers.forEach(({ layer }) => {
    layer.visible = false;
  });
  
  // デフォルトで表示するレイヤーを設定
  setLayerVisibility(modMetaData['服装1']?.children?.['いつもの服'], true);
  setLayerVisibility(modMetaData['枝豆']?.children?.['枝豆通常'], true);
  setLayerVisibility(modMetaData['服装1']?.children?.['右腕']?.children?.['基本'], true);
  setLayerVisibility(modMetaData['服装1']?.children?.['左腕']?.children?.['基本'], true);
  setLayerVisibility(modMetaData['目']?.children?.['目セット']?.children?.['普通白目'], true);
  setLayerVisibility(modMetaData['目']?.children?.['目セット']?.children?.['黒目']?.children?.['普通目'], true);
  setLayerVisibility(modMetaData['眉']?.children?.['眉'], true);
  setLayerVisibility(modMetaData['顔色']?.children?.['ほっぺ'], true);
  setLayerVisibility(modMetaData['口']?.children?.['むふ'], true);
};

// 目の状態を設定する関数
const setEyeState = (emotion: string | undefined): void => {
  const eyeSet = modMetaData['目']?.children?.['目セット'];
  const normalWhiteEye = eyeSet?.children?.['普通白目'];
  const normalBlackEye = eyeSet?.children?.['黒目']?.children?.['普通目'];
  const smileEye = modMetaData['目']?.children?.['にっこり'];

  if (emotion === 'smile') {
    setLayerVisibility(normalWhiteEye, false);
    setLayerVisibility(normalBlackEye, false);
    setLayerVisibility(smileEye, true);
  } else {
    setLayerVisibility(smileEye, false);
    setLayerVisibility(normalWhiteEye, true);
    setLayerVisibility(normalBlackEye, true);
  }
};

// 口の状態を設定する関数
const setMouthState = (
  frame: number,
  lipSync: number | undefined
): void => {
  const mouthChildren = modMetaData['口']?.children;
  if (!mouthChildren) return;

  let targetMouth: LayerMetadata | null = null;

  applyLipsync(
    frame,
    lipSync,
    () => {
      targetMouth = mouthChildren['ほあー'] || null;
    },
    () => {
      targetMouth = mouthChildren['むふ'] || null;
    }
  );

  // すべての口のレイヤーを非表示にする
  Object.values(mouthChildren).forEach((mouth) => {
    setLayerVisibility(mouth as LayerMetadata, false);
  });

  // 選択された口のレイヤーを表示する
  if (targetMouth) {
    setLayerVisibility(targetMouth, true);
  }
};

export interface ZundamonProps extends Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, 'style'> {
  style?: React.CSSProperties;
  emotion?: string;
  pose?: string;
  lipSync?: number;
  flipHorizontal?: boolean;
}

export const Zundamon: React.FC<ZundamonProps> = (props: ZundamonProps) => {
  const frame = useCurrentFrame();
  const { lipSync, emotion, pose, flipHorizontal, style, ...domProps } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // visible=trueのレイヤーを取得（useMemoでメモ化）
  const imageMetadata = useMemo((): Array<{element: LayerMetadata, imagePath: string}> => {
    // デフォルトのvisible状態を設定
    setDefaultVisibility();
    
    // emotionに応じて目のレイヤーを変更
    setEyeState(emotion);

    // lipsyncが数値なら口パクを行う（ほあーとむふを不規則に繰り返す）
    setMouthState(frame, lipSync);

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
      .catch((error) => {
        if (!cancelled) {
          console.error('Error loading images for Zundamon:', error);
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

  // canvasSizeが0の場合はデフォルトサイズを使用
  const displayWidth = canvasSize.width > 0 ? canvasSize.width : 1082;
  const displayHeight = canvasSize.height > 0 ? canvasSize.height : 1650;

  return (
    <canvas 
      className="zundamon"
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
