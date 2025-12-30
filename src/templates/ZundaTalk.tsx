import React, { useRef } from "react";
import { useCurrentFrame } from "remotion";
import { Zundamon } from "../Character/Zundamon/Zundamon";
import { Metan } from "../Character/Metan";
import { ZundaTalkProps, CharacterStyle } from "../schemas/zundaTalkSchema";
// import { useJump } from "./hooks/useJump";

// デフォルトのdurationInFrames（音声ファイルが読み込まれるまでの暫定値）
// 実際の値はコンポーネント内で計算される
const ZUNDAMON = "zundamon";
const METAN = "metan";
// デフォルトのスタイル
const defaultZundamonStyle: CharacterStyle = {
  position: "absolute",
  bottom: "0",
  left: "0",
  width: "800px",
  height: "800px",
};

const defaultMetanStyle: CharacterStyle = {
  position: "absolute",
  bottom: "0",
  right: "0",
  height: "800px",
};

export const ZundaTalk = ({ talks = [], style = {} }: ZundaTalkProps): React.JSX.Element => {
  const zunda = ZUNDAMON;
  const metan = METAN;
  const frame = useCurrentFrame();
  // 現在のフレームに応じたスタイルを選択
  let currentZundamonStyle: React.CSSProperties = defaultZundamonStyle as React.CSSProperties;
  let currentMetanStyle: React.CSSProperties = defaultMetanStyle as React.CSSProperties;

  // それぞれに初期値を設定
  let talkingSpeedZundamon: number = 0;
  let talkingSpeedMetan: number = 0;
  let emotionZundamon: React.RefObject<string | null> = useRef(null);
  let emotionMetan: React.RefObject<string | null> = useRef(null);
  for (const talk of talks) {
    if (talk.from === undefined || talk.from === null || !talk.durationInFrames) continue;
    let tmpZundamonStyle = currentZundamonStyle as React.CSSProperties;
    let tmpMetanStyle = currentMetanStyle as React.CSSProperties;
    if (frame >= talk.from && frame < talk.from + talk.durationInFrames) {
      // ずんだもんトーク中
      if (talk.voice === 3) {
        tmpMetanStyle = { ...currentMetanStyle, ...{filter: "brightness(0.5)"} } as React.CSSProperties;
        talkingSpeedZundamon = 1;
        emotionZundamon.current = talk.emotion ?? null;
      } else if (talk.voice === 2) {
      // めたんトーク中
        tmpZundamonStyle = { ...currentZundamonStyle, ...{filter: "brightness(0.5)"} } as React.CSSProperties;
        talkingSpeedMetan = 1;
        emotionMetan.current = talk.emotion ?? null;
      }
      currentZundamonStyle = { ...tmpZundamonStyle, ...(style?.[talk.key]?.[zunda] || {}) } as React.CSSProperties;
      currentMetanStyle = { ...tmpMetanStyle, ...(style?.[talk.key]?.[metan] || {}) } as React.CSSProperties;
    }
  }

  return (
    <>
      <Zundamon style={currentZundamonStyle} emotion={emotionZundamon.current || undefined} pose="" lipSync={talkingSpeedZundamon} />
      <Metan style={currentMetanStyle} />
    </>
  );
};
