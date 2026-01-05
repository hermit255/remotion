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

// デフォルトのvisible状態を設定する関数
const setDefaultVisibility = () => {
  // すべてのレイヤーを一旦非表示にする
  allLayers.forEach(({ layer }) => {
    layer.visible = false;
  });
  
  // デフォルトで表示するレイヤーを設定
  modMetaData['服装1']?.children?.['いつもの服'] && (modMetaData['服装1'].children!['いつもの服'].visible = true);
  modMetaData['枝豆']?.children?.['枝豆通常'] && (modMetaData['枝豆'].children!['枝豆通常'].visible = true);
  modMetaData['服装1']?.children?.['右腕']?.children?.['基本'] && (modMetaData['服装1'].children!['右腕'].children!['基本'].visible = true);
  modMetaData['服装1']?.children?.['左腕']?.children?.['基本'] && (modMetaData['服装1'].children!['左腕'].children!['基本'].visible = true);
  modMetaData['目']?.children?.['目セット']?.children?.['普通白目'] && (modMetaData['目'].children!['目セット'].children!['普通白目'].visible = true);
  modMetaData['目']?.children?.['目セット']?.children?.['黒目']?.children?.['普通目'] && (modMetaData['目'].children!['目セット'].children!['黒目'].children!['普通目'].visible = true);
  modMetaData['眉']?.children?.['眉'] && (modMetaData['眉'].children!['眉'].visible = true);
  modMetaData['顔色']?.children?.['ほっぺ'] && (modMetaData['顔色'].children!['ほっぺ'].visible = true);
  modMetaData['口']?.children?.['むふ'] && (modMetaData['口'].children!['むふ'].visible = true);
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
    if (emotion === 'smile') {
      // 通常の目を非表示にする
      modMetaData['目']?.children?.['目セット']?.children?.['普通白目'] && (modMetaData['目'].children!['目セット'].children!['普通白目'].visible = false);
      modMetaData['目']?.children?.['目セット']?.children?.['黒目']?.children?.['普通目'] && (modMetaData['目'].children!['目セット'].children!['黒目'].children!['普通目'].visible = false);
      // にっこり目を表示する
      modMetaData['目']?.children?.['にっこり'] && (modMetaData['目'].children!['にっこり'].visible = true);
    } else {
      // にっこり目を非表示にする
      modMetaData['目']?.children?.['にっこり'] && (modMetaData['目'].children!['にっこり'].visible = false);
      // 通常の目を表示する
      modMetaData['目']?.children?.['目セット']?.children?.['普通白目'] && (modMetaData['目'].children!['目セット'].children!['普通白目'].visible = true);
      modMetaData['目']?.children?.['目セット']?.children?.['黒目']?.children?.['普通目'] && (modMetaData['目'].children!['目セット'].children!['黒目'].children!['普通目'].visible = true);
    }

    // lipsyncが数値なら口パクを行う（ほあーとむふを不規則に繰り返す）
    let mouthLayer: LayerMetadata | null = null;
    applyLipsync(
      frame,
      lipSync,
      () => {
        // 口を開いている状態を作るcallback
        mouthLayer = modMetaData['口']?.children?.['ほあー'] || null;
      },
      () => {
        // 口を閉じている状態を作るcallback
        mouthLayer = modMetaData['口']?.children?.['むふ'] || null;
      }
    );
    
    // 口のレイヤーを更新
    if (mouthLayer) {
      // すべての口のレイヤーを非表示にする
      Object.values(modMetaData['口']?.children || {}).forEach((mouth) => {
        (mouth as LayerMetadata).visible = false;
      });
      // 選択された口のレイヤーを表示する
      mouthLayer.visible = true;
    }

    // visible=trueのレイヤーだけを取得し、indexでソート（Photoshopと同じ描画順序）
    return getVisibleLayersSorted(allLayers);
  }, [emotion, pose, lipSync, frame]); // frameとlipSyncを依存配列に追加

  // canvasのサイズを計算（useMemoでメモ化）
  const canvasSize = useMemo(() => {
    return calculateCanvasSize(imageMetadata);
  }, [imageMetadata]);

  // canvasのサイズを初期設定
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // canvasのサイズを設定（画像読み込み前に設定）
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
    }
  }, [canvasSize]);

  // canvasに画像を描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || imageMetadata.length === 0) return;

    renderLayersToCanvas(canvas, imageMetadata).catch((error) => {
      console.error('Error loading images for Zundamon:', error);
    });
  }, [imageMetadata, canvasSize]);

  const containerStyle: React.CSSProperties = {
    ...style,
    ...(flipHorizontal && {
      transform: style?.transform 
        ? `${style.transform} scaleX(-1)`
        : 'scaleX(-1)',
    }),
  };

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
