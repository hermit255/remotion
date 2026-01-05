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

const stateDefault = {
  body: modMetaData['服装1']?.children?.['いつもの服'],
  edamame: modMetaData['枝豆']?.children?.['枝豆通常'],
  rightArm: modMetaData['服装1']?.children?.['右腕']?.children?.['基本'],
  leftArm: modMetaData['服装1']?.children?.['左腕']?.children?.['基本'],
  whiteEye: modMetaData['目']?.children?.['目セット']?.children?.['普通白目'],
  blackEye: modMetaData['目']?.children?.['目セット']?.children?.['黒目']?.children?.['普通目'],
  singleEye: null,
  eyebrow: modMetaData['眉']?.children?.['眉'],
  complexion: modMetaData['顔色']?.children?.['ほっぺ'],
  mouth: modMetaData['口']?.children?.['むふ'],
}

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
  
  // stateの各要素をメタデータとして取得（useMemoでメモ化）
  const imageMetadata = useMemo((): Array<{element: LayerMetadata, imagePath: string}> => {
    const state = {...stateDefault};
    if (emotion === 'smile') {
      state.singleEye = modMetaData['目']?.children?.['にっこり'];
      state.blackEye = null;
      state.whiteEye = null;
    } else {
      state.singleEye = stateDefault.singleEye;
      state.blackEye = stateDefault.blackEye;
      state.whiteEye = stateDefault.whiteEye;

    }

    // lipsyncが数値なら口パクを行う（ほあーとむふを不規則に繰り返す）
    applyLipsync(
      frame,
      lipSync,
      () => {
        // 口を開いている状態を作るcallback
        state.mouth = modMetaData['口']?.children?.['ほあー'];
      },
      () => {
        // 口を閉じている状態を作るcallback
        state.mouth = stateDefault.mouth;
      }
    );

    return Object.values(state)
      .filter((element): element is LayerMetadata => element !== undefined && element !== null)
      .map((element) => {
        const imagePath = (element as any).imagePath;
        return { element, imagePath };
      })
      .filter((item): item is {element: LayerMetadata, imagePath: string} => item.imagePath !== undefined && item.imagePath !== null);
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
