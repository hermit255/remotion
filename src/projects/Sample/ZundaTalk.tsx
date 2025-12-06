import { interpolate, staticFile } from "remotion";
import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
} from "remotion";
import { z } from "zod";
import { Zundamon } from "../../../Character/Zundamon";
import { Metan } from "../../../Character/Metan";
import { useAudioDurationInFrames } from "../../hooks/useAudioDurationInFrames";
// import { useJump } from "./hooks/useJump";

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
export const ZundaTalk: React.FC<z.infer<typeof zundaTalkSchema>> = () => {
  const overWrapFrames = 5; // (描画時ちらつき防止)オーバーラップするフレーム数
  const intervalFrames = 10 + overWrapFrames;
  // コンポーネント内でフックを呼び出す（ループではなく個別に）
  const audioDurationInFrames0 = useAudioDurationInFrames(sounds[0]);
  const audioDurationInFrames1 = useAudioDurationInFrames(sounds[1]);
  const audioDurationInFrames2 = useAudioDurationInFrames(sounds[2]);
  
  const audioDurationInFrames = [
    audioDurationInFrames0,
    audioDurationInFrames1,
    audioDurationInFrames2,
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Html5Audio src={staticFile("sound/bgm/Morning.mp3")} />
      <AbsoluteFill style={{ opacity }}>
        <Sequence
          from={0}
          durationInFrames={audioDurationInFrames[0] + intervalFrames}
        >
          <Html5Audio src={sounds[0]} />
          <Metan style={
          {
            position: "absolute",
            bottom: "0", right: "0",
            height: "500px",
            filter: "brightness(0.5)",
          }}/>
          <Zundamon style={
          {
            position: "absolute",
            bottom: "0", left: "0",
            height: "500px",
          }}/>
        </Sequence>
        <Sequence
          from={audioDurationInFrames[0] + intervalFrames - overWrapFrames}
          durationInFrames={audioDurationInFrames[1] + intervalFrames}
        >
          <Html5Audio src={sounds[1]} />
          <Metan style={
          {
            position: "absolute",
            bottom: "0", right: "0",
            height: "500px",
          }}/>
          <Zundamon style={
          {
            position: "absolute",
            bottom: "0", left: "0",
            height: "500px",
            filter: "brightness(0.5)",
          }}/>
        </Sequence>
        <Sequence 
          from={audioDurationInFrames[0] + audioDurationInFrames[1] + (intervalFrames * 2) - (overWrapFrames * 2)}
          durationInFrames={audioDurationInFrames[2]}
        >
          <Html5Audio src={sounds[2]} />
          <Metan style={
          {
            position: "absolute",
            bottom: "0", right: "0",
            height: "500px",
            filter: "brightness(0.5)",
          }}/>
          <Zundamon style={
          {
            position: "absolute",
            bottom: "0", left: "0",
            height: "500px",
          }}/>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
