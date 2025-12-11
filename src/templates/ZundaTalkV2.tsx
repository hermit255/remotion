import React from "react";
import { staticFile } from "remotion";
import {
  AbsoluteFill,
  Html5Audio,
  useCurrentFrame,
} from "remotion";
import { Zundamon } from "../Character/Zundamon";
import { Metan } from "../Character/Metan";
import { useTalks, genSequenceTalk, useTotalDurationInFrames } from "../components/Sequence";
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
  // scale: "0.5",
  height: "800px",
};

const defaultMetanStyle: CharacterStyle = {
  position: "absolute",
  bottom: "0",
  right: "0",
  height: "800px",
};

export const ZundaTalkV2 = ({ messages, style, backgroundImagePath, bgmPath, children }: ZundaTalkProps): React.JSX.Element => {
  const talks = useTalks(messages);
  console.log(useTotalDurationInFrames(talks));
  const zunda = ZUNDAMON;
  const metan = METAN;
  // const style: Record<string, Record<string, CharacterStyle>> = {
  //   sample_1: { [metan]: {} },
  //   sample_2: { [zunda]: {} },
  //   sample_3: { [zunda]: {} },
  // };

  const frame = useCurrentFrame();

  // 現在のフレームに応じたスタイルを選択
  let currentZundamonStyle: React.CSSProperties = defaultZundamonStyle as React.CSSProperties;
  let currentMetanStyle: React.CSSProperties = defaultMetanStyle as React.CSSProperties;

  for (const talk of talks) {
    if (talk.from === undefined || talk.from === null || !talk.durationInFrames) continue;
    let tmpZundamonStyle = currentZundamonStyle as React.CSSProperties;
    let tmpMetanStyle = currentMetanStyle as React.CSSProperties;
    if (frame >= talk.from && frame < talk.from + talk.durationInFrames) {
      if (talk.voice === 3) {
        tmpMetanStyle = { ...currentMetanStyle, ...{filter: "brightness(0.5)"} } as React.CSSProperties;
      } else if (talk.voice === 2) {
        tmpZundamonStyle = { ...currentZundamonStyle, ...{filter: "brightness(0.5)"} } as React.CSSProperties;
      }
      currentZundamonStyle = { ...tmpZundamonStyle, ...(style?.[talk.key]?.[zunda] || {}) } as React.CSSProperties;
      currentMetanStyle = { ...tmpMetanStyle, ...(style?.[talk.key]?.[metan] || {}) } as React.CSSProperties;
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Html5Audio src={staticFile(bgmPath || "sound/bgm/2_23_AM.mp3")} volume={0.1} loop />
      <img src={staticFile(backgroundImagePath || "img/bg/office.jpg")} alt="bg" style={{}} />
      {/* ZundamonとMetanを常に描画（スタイルは現在のフレームに応じて変更） */}
      <Zundamon style={currentZundamonStyle} />
      <Metan style={currentMetanStyle} />
      {talks.map((talk) => genSequenceTalk(talk))}
      {children}
    </AbsoluteFill>
  );
};
