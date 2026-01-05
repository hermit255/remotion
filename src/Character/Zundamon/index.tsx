import React, { useMemo, useRef, useEffect } from "react";
import {
  useCurrentFrame,
} from "remotion";
import { metadataSchema, processMetadata, type LayerMetadata, type Metadata } from "../../util/Psd";
import type { ZundamonMetadata } from "./types";
import { applyLipsync } from "../lipsync";

const basePath = "img/characters/Zundamon/";
const scale = 0.5;
const metadataJson = require("./metadata.json");
const metaData: Metadata = metadataSchema.parse(metadataJson);

// metaDataの各要素およびchildrenに対してconvertChildrenを再帰的に適用
const modMetaData = processMetadata(metaData, basePath) as ZundamonMetadata;

// Metadataを再帰的に走査して、すべてのレイヤーを取得する関数
// 親レイヤーのindexも保持して、描画順序を決定する
const collectAllLayers = (metadata: Record<string, LayerMetadata>): Array<{layer: LayerMetadata, parentIndex: number}> => {
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

export interface ZundamonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
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
    return allLayers
      .filter(({ layer }) => layer.visible === true)
      .map(({ layer, parentIndex }) => {
        const imagePath = (layer as any).imagePath;
        return { element: layer, imagePath, parentIndex };
      })
      .filter((item): item is {element: LayerMetadata, imagePath: string, parentIndex: number} => item.imagePath !== undefined && item.imagePath !== null)
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
  }, [emotion, pose, lipSync, frame]); // frameとlipSyncを依存配列に追加

  // canvasのサイズを計算（useMemoでメモ化）
  const canvasSize = useMemo(() => {
    let maxWidth = 0;
    let maxHeight = 0;
    imageMetadata.forEach(({ element }) => {
      const right = (element.left + element.width);
      const bottom = (element.top + element.height);
      maxWidth = Math.max(maxWidth, right);
      maxHeight = Math.max(maxHeight, bottom);
    });
    return { width: maxWidth, height: maxHeight };
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 画像を読み込んで描画
    const loadAndDrawImages = async () => {
      try {
        const images = await Promise.all(
          imageMetadata.map(({ imagePath }) => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = (error) => {
                console.error(`Failed to load image: ${imagePath}`, error);
                reject(error);
              };
              img.src = imagePath;
            });
          })
        );

        // canvasをクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 各画像を描画
        images.forEach((img, index) => {
          const { element } = imageMetadata[index];
          const x = element.left;
          const y = element.top;
          const width = element.width;
          const height = element.height;
          
          ctx.drawImage(img, x, y, width, height);
        });
      } catch (error) {
        console.error('Error loading images for Zundamon:', error);
      }
    };

    loadAndDrawImages();
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
    <div className="zundamon" {...domProps} style={containerStyle}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block',
          width: `${displayWidth * scale}px`,
          height: `${displayHeight * scale}px`,
        }} 
      />
    </div>
  );
};
