import { staticFile } from "remotion";
import {
  AbsoluteFill,
  Html5Audio,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { Zundamon } from "../../Character/Zundamon";
import { Metan } from "../../Character/Metan";
import { useTalks, genSequenceTalk } from "./Sequence";
// import { useJump } from "./hooks/useJump";

// 各SequenceでのZundamonとMetanのスタイルを定義する型
type CharacterStyle = {
  position?: React.CSSProperties["position"];
  bottom?: string | number;
  left?: string | number;
  right?: string | number;
  height?: string | number;
  filter?: string;
  opacity?: number;
  transform?: string;
};

// messagesを渡すようにしたい
export const zundaTalkSchema = z.object({
  messages: z.array(z.object({
    key: z.string(),
    fileName: z.string(),
    voice: z.number(),
    text: z.string(),
  })),
});

// デフォルトのdurationInFrames（音声ファイルが読み込まれるまでの暫定値）
// 実際の値はコンポーネント内で計算される
export const ZundaTalkDurationInFrames = 274; // 暫定値（fps=30なら10秒）

const ZUNDAMON = "zundamon";
const METAN = "metan";
// デフォルトのスタイル
const defaultZundamonStyle: CharacterStyle = {
  position: "absolute",
  bottom: "0",
  left: "0",
  height: "500px",
};

const defaultMetanStyle: CharacterStyle = {
  position: "absolute",
  bottom: "0",
  right: "0",
  height: "500px",
};

export const ZundaTalk: React.FC<z.infer<typeof zundaTalkSchema>> = ({ messages }) => {
  const talks = useTalks(messages);

  const zunda = ZUNDAMON;
  const metan = METAN;
  const style: Record<string, Record<string, CharacterStyle>> = {
    sample_1: { [metan]: {} },
    sample_2: { [zunda]: {} },
    sample_3: { [zunda]: {} },
  };

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
      currentZundamonStyle = { ...tmpZundamonStyle, ...(style[talk.key][zunda] || {}) } as React.CSSProperties;
      currentMetanStyle = { ...tmpMetanStyle, ...(style[talk.key][metan] || {}) } as React.CSSProperties;
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Html5Audio src={staticFile("sound/bgm/Morning.mp3")} />
      <img src={staticFile("img/bg/room.jpg")} alt="bg" style={{}} />
      {/* ZundamonとMetanを常に描画（スタイルは現在のフレームに応じて変更） */}
      <Zundamon style={currentZundamonStyle} />
      <Metan style={currentMetanStyle} />
      {talks.map((talk) => genSequenceTalk(talk))}
    </AbsoluteFill>
  );
};
