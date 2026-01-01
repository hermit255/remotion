import React, { useMemo } from "react";
import {
  useCurrentFrame,
} from "remotion";
import { metadataSchema, processMetadata, type LayerMetadata, type Metadata } from "../../util/Psd";
import type { MetanMetadata } from "./types";
import { applyLipsync } from "../lipsync";

const basePath = "img/characters/Metan/";
const scale = 0.43;
const partsStyleBase: React.CSSProperties = {
  position: 'absolute',
  scale: scale,
  transformOrigin: 'top left',
};
const metadataJson = require("./metadata.json");
const metaData: Metadata = metadataSchema.parse(metadataJson);

// metaDataの各要素およびchildrenに対してconvertChildrenを再帰的に適用
const modMetaData = processMetadata(metaData, basePath) as MetanMetadata;

const stateDefault = {
  hairAccessory_1: modMetaData['頭部アクセサリ']?.children?.['ヘッドドレス'],
  hairAccessory_2: modMetaData['頭部アクセサリ']?.children?.['髪留めハート'],
  rightDril: modMetaData['ツインドリル右'],
  leftDril: modMetaData['ツインドリル左'],
  body: modMetaData['白ロリ服']?.children?.['体'],
  rightArm: modMetaData['白ロリ服']?.children?.['右腕']?.children?.['指差す'],
  leftArm: modMetaData['白ロリ服']?.children?.['左腕']?.children?.['マイク'],
  frontHair: modMetaData['前髪もみあげ'],
  eyebrow: modMetaData['眉']?.children?.['太眉ごきげん'],
  whiteEye: modMetaData['目']?.children?.['目セット']?.children?.['普通白目'],
  blackEye: modMetaData['目']?.children?.['目セット']?.children?.['黒目']?.children?.['カメラ目線'],
  singleEye: null,
  mouth: modMetaData['口']?.children?.['ほほえみ'],
  complexion: modMetaData['顔色']?.children?.['普通2'],
}

export interface MetanProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  style?: React.CSSProperties;
  emotion?: string;
  pose?: string;
  lipSync?: number;
}

export const Metan: React.FC<MetanProps> = (props: MetanProps) => {
  const frame = useCurrentFrame();
  const { lipSync, emotion, pose, ...domProps } = props;
  
  // stateの各要素をdomとして出力する関数（useMemoでメモ化）
  const images = useMemo((): React.JSX.Element[] => {
    const state = {...stateDefault};
    // Metanにはsmile用の特別な目のパーツがないため、通常の目を使用
    state.singleEye = stateDefault.singleEye;
    state.blackEye = stateDefault.blackEye;
    state.whiteEye = stateDefault.whiteEye;

    // lipsyncが数値なら口パクを行う（うえーとわあーを不規則に繰り返す）
    applyLipsync(
      frame,
      lipSync,
      () => {
        // 口を開いている状態を作るcallback
        state.mouth = modMetaData['口']?.children?.['わあー'];
      },
      () => {
        // 口を閉じている状態を作るcallback
        state.mouth = stateDefault.mouth;
      }
    );

    console.log('state', state);
    return Object.values(state)
      .filter((element): element is LayerMetadata => element !== undefined && element !== null)
      .map((element, index) => {
        console.log('name', element.name);
        console.log('el', element);
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
    <div className="metan" {...domProps}>
      {images}
    </div>
  );
};
