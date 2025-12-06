import { staticFile } from "remotion";
import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  OffthreadVideo,
  useVideoConfig,
} from "remotion";
import { useAudioData } from "@remotion/media-utils";
import { z } from "zod";
import { Zundamon } from "../Character/Zundamon";
import { Metan } from "../Character/Metan";
// import { useJump } from "./hooks/useJump";

export const zundaTalkSchema = z.object({});

const opacity=1;
export const ZundaTalk: React.FC<z.infer<typeof zundaTalkSchema>> = () => {
  const { fps } = useVideoConfig();
  const audioSrc = staticFile("sound/voice/sample/sample_1.wav");
  const audioData = useAudioData(audioSrc);
  
  // 音声ファイルの長さをフレーム数に変換
  const audioDurationInFrames = audioData
    ? Math.ceil(audioData.durationInSeconds * fps)
    : 75; // 読み込み中の場合はデフォルト値

  // ZundaTalk内部でジャンプパラメータを設定
  // const bounce = useJump({
  //   jumpDuration: 5, // 1回のジャンプが開始から終了まで5フレーム
  //   jumpInterval: 25, // ジャンプ発生のインターバル25フレーム
  //   jumpHeight: 20, // 跳ねる高さ（ピクセル）
  // });

  // A <AbsoluteFill> is just a absolutely positioned <div>!
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Html5Audio src={staticFile("sound/bgm/Morning.mp3")} />
			<OffthreadVideo src={staticFile("movie/flower.webm")} muted={false} />
      
      <AbsoluteFill style={{ opacity }}>
        <Sequence from={0} durationInFrames={audioDurationInFrames}>
          <Html5Audio src={audioSrc} />
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
        <Sequence from={audioDurationInFrames} durationInFrames={audioDurationInFrames}>
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
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
