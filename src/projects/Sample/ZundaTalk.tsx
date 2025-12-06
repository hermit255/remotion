import { staticFile } from "remotion";
import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { Zundamon } from "../../../Character/Zundamon";
import { Metan } from "../../../Character/Metan";
import { useAudioDurationInFrames } from "../../hooks/useAudioDurationInFrames";
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

export const zundaTalkSchema = z.object({});

const sounds: string[] = [
  staticFile("sound/voice/sample/sample_1.wav"),
  staticFile("sound/voice/sample/sample_2.wav"),
  staticFile("sound/voice/sample/sample_3.wav"),
];

// デフォルトのdurationInFrames（音声ファイルが読み込まれるまでの暫定値）
// 実際の値はコンポーネント内で計算される
export const ZundaTalkDurationInFrames = 274; // 暫定値（fps=30なら10秒）

const opacity=1;

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

export const ZundaTalk: React.FC<z.infer<typeof zundaTalkSchema>> = () => {
  const intervalFrames = 10;
  // コンポーネント内でフックを呼び出す（ループではなく個別に）
  const audioDurationInFrames0 = useAudioDurationInFrames(sounds[0]);
  const audioDurationInFrames1 = useAudioDurationInFrames(sounds[1]);
  const audioDurationInFrames2 = useAudioDurationInFrames(sounds[2]);
  
  const audioDurationInFrames = [
    audioDurationInFrames0,
    audioDurationInFrames1,
    audioDurationInFrames2,
  ];

  // 各Sequenceでのスタイルをコンポーネント内で定義
  const seq0ZundamonStyle: React.CSSProperties = {
    ...defaultZundamonStyle,
  };
  const seq0MetanStyle: React.CSSProperties = {
    ...defaultMetanStyle,
    filter: "brightness(0.5)",
  };
  const seq1ZundamonStyle: React.CSSProperties = {
    ...defaultZundamonStyle,
    filter: "brightness(0.5)",
  };
  const seq1MetanStyle: React.CSSProperties = {
    ...defaultMetanStyle,
  };
  const seq2ZundamonStyle: React.CSSProperties = {
    ...defaultZundamonStyle,
  };
  const seq2MetanStyle: React.CSSProperties = {
    ...defaultMetanStyle,
    filter: "brightness(0.5)",
  };

  const frame = useCurrentFrame();

  // 現在のフレームに応じて適用するスタイルを決定
  const seq1Start = audioDurationInFrames[0] + intervalFrames;
  const seq1End = seq1Start + audioDurationInFrames[1] + intervalFrames;
  const seq2Start = audioDurationInFrames[0] + audioDurationInFrames[1] + (intervalFrames * 2);
  const seq2End = seq2Start + audioDurationInFrames[2];

  // 現在のフレームに応じたスタイルを選択
  let currentZundamonStyle: React.CSSProperties = seq0ZundamonStyle as React.CSSProperties;
  let currentMetanStyle: React.CSSProperties = seq0MetanStyle as React.CSSProperties;

  if (frame >= seq1Start && frame < seq1End) {
    currentZundamonStyle = seq1ZundamonStyle as React.CSSProperties;
    currentMetanStyle = seq1MetanStyle as React.CSSProperties;
  } else if (frame >= seq2Start && frame < seq2End) {
    currentZundamonStyle = seq2ZundamonStyle as React.CSSProperties;
    currentMetanStyle = seq2MetanStyle as React.CSSProperties;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Html5Audio src={staticFile("sound/bgm/Morning.mp3")} />
      <AbsoluteFill style={{ opacity }}>
        {/* ZundamonとMetanを常に描画（スタイルは現在のフレームに応じて変更） */}
        <Zundamon style={currentZundamonStyle} />
        <Metan style={currentMetanStyle} />
        
        {/* 音声だけはSequence内に配置（srcの変更を反映するため） */}
        <Sequence
          from={0}
          durationInFrames={audioDurationInFrames[0] + intervalFrames}
        >
          <Html5Audio src={sounds[0]} />
        </Sequence>
        <Sequence
          from={seq1Start}
          durationInFrames={audioDurationInFrames[1] + intervalFrames}
        >
          <Html5Audio src={sounds[1]} />
        </Sequence>
        <Sequence
          from={seq2Start}
          durationInFrames={audioDurationInFrames[2]}
        >
          <Html5Audio src={sounds[2]} />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
