import React from "react";
import type { LayerMetadata } from "../../util/Psd";
import type { MetanMetadata } from "./types";
import { createCharacterImage, setLayerVisibility, type CharacterConfig } from "../Common";
import { applyLipsync } from "../lipsync";

const basePath = "img/characters/Metan/";
const scale = 0.43;
const metadataJson = require("./metadata.json");

// デフォルトのvisible状態を設定する関数
const setDefaultVisibility = (
  modMetaData: MetanMetadata,
  _allLayers: Array<{layer: LayerMetadata, parentIndex: number}>
): void => {
  // デフォルトで表示するレイヤーを設定
  setLayerVisibility(modMetaData['頭部アクセサリ']?.children?.['ヘッドドレス'], true);
  setLayerVisibility(modMetaData['頭部アクセサリ']?.children?.['髪留めハート'], true);
  setLayerVisibility(modMetaData['ツインドリル右'], true);
  setLayerVisibility(modMetaData['ツインドリル左'], true);
  setLayerVisibility(modMetaData['白ロリ服']?.children?.['体'], true);
  setLayerVisibility(modMetaData['白ロリ服']?.children?.['右腕']?.children?.['指差す'], true);
  setLayerVisibility(modMetaData['白ロリ服']?.children?.['左腕']?.children?.['マイク'], true);
  setLayerVisibility(modMetaData['前髪もみあげ'], true);
  setLayerVisibility(modMetaData['眉']?.children?.['太眉ごきげん'], true);
  setLayerVisibility(modMetaData['目']?.children?.['目セット']?.children?.['普通白目'], true);
  setLayerVisibility(modMetaData['目']?.children?.['目セット']?.children?.['黒目']?.children?.['カメラ目線'], true);
  setLayerVisibility(modMetaData['口']?.children?.['ほほえみ'], true);
  setLayerVisibility(modMetaData['顔色']?.children?.['普通2'], true);
};

// 口の状態を設定する関数
const setMouthState = (
  modMetaData: MetanMetadata,
  frame: number,
  lipSync: number | undefined
): void => {
  const mouthChildren = modMetaData['口']?.children;
  if (!mouthChildren) return;

  const defaultMouth = mouthChildren['ほほえみ'];
  let targetMouth: LayerMetadata | null = null;

  applyLipsync(
    frame,
    lipSync,
    () => {
      // 口を開いている状態を作るcallback
      targetMouth = mouthChildren['わあー'] || null;
    },
    () => {
      // 口を閉じている状態を作るcallback
      targetMouth = defaultMouth || null;
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

const config: CharacterConfig<MetanMetadata> = {
  metadataJson,
  basePath,
  setDefaultVisibility,
  setMouthState,
};

export interface MetanProps extends React.HTMLAttributes<HTMLDivElement> {
  style?: React.CSSProperties;
  emotion?: string;
  pose?: string;
  lipSync?: number;
  flipHorizontal?: boolean;
  scale?: number;
}

// scaleのデフォルト値を設定するラッパーコンポーネント
const MetanComponent = createCharacterImage(config);

export const Metan: React.FC<MetanProps> = (props) => {
  return <MetanComponent {...props} scale={props.scale ?? scale} />;
};
