import React from "react";
import { useCurrentFrame } from "remotion";
import { Zundamon } from "../Character/Zundamon";
import { Metan } from "../Character/Metan";
import { ZundaTalkProps, CharacterStyle } from "../util/schema/zundaTalkSchema";
// import { useJump } from "./hooks/useJump";

// デフォルトのdurationInFrames（音声ファイルが読み込まれるまでの暫定値）
// 実際の値はコンポーネント内で計算される
const ZUNDAMON = "zundamon";
const METAN = "metan";
// デフォルトのスタイル
const defaultZundamonStyle: CharacterStyle = {
  position: "absolute",
  top: "27%",           /* 親の高さ50%の位置に配置 */
  left: "0%",          /* 親の幅50%の位置に配置 */
  transform: "translate(-50%, -50%)", /* 自身の幅・高さの半分だけ戻す */
  scale: 0.5,
};

const defaultMetanStyle: CharacterStyle = {
  position: "absolute",
  // bottom: "-1000px",
  // right: "-300px",
  top: "113%",           /* 親の高さ50%の位置に配置 */
  right: "-63%",          /* 親の幅50%の位置に配置 */
  transform: "translate(-50%, -50%)", /* 自身の幅・高さの半分だけ戻す */
  width: "1082px",
  height: "1820px",
};

export const ZundaTalk = ({ talks = [], style = {} }: ZundaTalkProps): React.JSX.Element => {
  const frame = useCurrentFrame();
  
  // 現在のフレームに応じたスタイルと状態を選択
  let currentZundamonStyle: React.CSSProperties = defaultZundamonStyle as React.CSSProperties;
  let currentMetanStyle: React.CSSProperties = defaultMetanStyle as React.CSSProperties;
  let talkingSpeedZundamon = 0;
  let talkingSpeedMetan = 0;
  let emotionZundamon: string | null = null;
  let emotionMetan: string | null = null;

  for (const talk of talks) {
    if (talk.from === undefined || talk.from === null || !talk.durationInFrames) continue;
    
    if (frame >= talk.from && frame < talk.from + talk.durationInFrames) {
      if (talk.voice === 3) {
        // ずんだもんトーク中
        talkingSpeedZundamon = 1;
        emotionZundamon = talk.emotion ?? null;
        currentZundamonStyle = { ...currentZundamonStyle, ...(style?.[talk.key]?.[ZUNDAMON] || {}) } as React.CSSProperties;
        currentMetanStyle = { ...currentMetanStyle, ...(style?.[talk.key]?.[METAN] || {}) } as React.CSSProperties;
      } else if (talk.voice === 2) {
        // めたんトーク中
        talkingSpeedMetan = 1;
        emotionMetan = talk.emotion ?? null;
        currentZundamonStyle = { ...currentZundamonStyle, ...(style?.[talk.key]?.[ZUNDAMON] || {}) } as React.CSSProperties;
        currentMetanStyle = { ...currentMetanStyle, ...(style?.[talk.key]?.[METAN] || {}) } as React.CSSProperties;
      }
    }
  }

  return (
    <>
      <Zundamon
        style={currentZundamonStyle}
        emotion={emotionZundamon || undefined}
        pose=""
        lipSync={talkingSpeedZundamon}
        flipHorizontal={true}
      />
      <Metan
        style={currentMetanStyle}
        emotion={emotionMetan || undefined}
        pose=""
        lipSync={talkingSpeedMetan}
        flipHorizontal={false}
      />
    </>
  );
};
