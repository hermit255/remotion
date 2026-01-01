import React, { useMemo } from "react";
import {
  useCurrentFrame,
} from "remotion";
import { metadataSchema, processMetadata, type LayerMetadata, type Metadata } from "../../util/Psd";
import type { ZundamonMetadata } from "./types";
import { applyLipsync } from "../lipsync";

const basePath = "img/characters/Zundamon/";
const scale = 0.5;
const partsStyleBase: React.CSSProperties = {
  position: 'absolute',
  scale: scale,
  transformOrigin: 'top left',
};
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
}

export const Zundamon: React.FC<ZundamonProps> = (props: ZundamonProps) => {
  const frame = useCurrentFrame();
  const { lipSync, emotion, pose, ...domProps } = props;
  
  // stateの各要素をdomとして出力する関数（useMemoでメモ化）
  const images = useMemo((): React.JSX.Element[] => {
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
      .map((element, index) => {
        const imagePath = (element as any).imagePath;
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
      .filter((element): element is React.JSX.Element => element !== null);
  }, [emotion, pose, lipSync, frame]); // frameとlipSyncを依存配列に追加

  return (
    <div className="zundamon" {...domProps}>
      {images}
    </div>
  );
};
