import React from "react";
import type { LayerMetadata } from "../../util/Psd";
import type { ZundamonMetadata } from "./types";
import { createCharacterCanvas, setLayerVisibility, type CharacterConfig } from "../Common";
import { applyLipsync } from "../lipsync";

const basePath = "img/characters/Zundamon/";
const metadataJson = require("./metadata.json");

// デフォルトのvisible状態を設定する関数
const setDefaultVisibility = (
  modMetaData: ZundamonMetadata,
  _allLayers: Array<{layer: LayerMetadata, parentIndex: number}>
): void => {
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
const setEyeState = (
  modMetaData: ZundamonMetadata,
  emotion: string | undefined
): void => {
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
  modMetaData: ZundamonMetadata,
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

const config: CharacterConfig<ZundamonMetadata> = {
  metadataJson,
  basePath,
  setDefaultVisibility,
  setEyeState,
  setMouthState,
};

export interface ZundamonProps extends Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, 'style'> {
  style?: React.CSSProperties;
  emotion?: string;
  pose?: string;
  lipSync?: number;
  flipHorizontal?: boolean;
}

// classNameのデフォルト値を設定するラッパーコンポーネント
const ZundamonComponent = createCharacterCanvas(config);

export const Zundamon: React.FC<ZundamonProps> = (props) => {
  return <ZundamonComponent {...props} className={props.className ?? "zundamon"} />;
};
