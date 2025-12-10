import { useMemo } from "react";
import { staticFile } from "remotion";
// import { loadFont } from '@remotion/google-fonts/NotoSansJP';
import { loadFont } from '@remotion/google-fonts/ZenMaruGothic';
const {fontFamily} = loadFont(); 
import {
  Html5Audio,
  Sequence,
} from "remotion";
import { useAudioDurationInFrames } from "../hooks/useAudioDurationInFrames";

const voicePath: string = "sound/voice/";
const defaultIntervalFrame = 10;
export type Talk = {
  key: string;
  voice: number;
  src: string;
  intervalFrame?: number;
  audioDurationInFrames: number;
  durationInFrames?: number;
  from?: number;
  text: string;
};
export type Message = {
  key: string;
  fileName: string;
  voice: number;
  text: string;
  intervalFrame?: number;
};
// Sequenceを生成する関数
export const genSequenceTalk: React.FC<Talk> = (talk: Talk) => {
  return (talk.from !== undefined && talk.from !== null && talk.durationInFrames && talk.src) && (
    <Sequence
      key={talk.key}
      from={talk.from}
      durationInFrames={talk.durationInFrames}
    >
      <Html5Audio src={talk.src} volume={1.0} />
      <div style={{
        position: "absolute", bottom: "10%", width: "1920px",
        display: "flex", justifyContent: "center",
      }}>
        <span style={{
          fontSize: "50px", fontWeight: "bold",
          maxWidth: "95%", margin: "0 auto", padding: "10px", borderRadius: "10px",
          fontFamily, color: "white", backgroundColor: "black"
        }}>
          {talk.text}
        </span>
      </div>
    </Sequence>
  )
};

/**
 * talks配列のdurationInFramesの合計を計算するhook
 * @param talks - Talk型の配列
 * @returns durationInFramesの合計値（undefinedの場合は0として扱う）
 */
export const useTotalDurationInFrames = (talks: Talk[]): number => {
  return useMemo(() => {
    return talks.reduce((total, talk) => {
      return total + (talk.durationInFrames || 0);
    }, 0);
  }, [talks]);
};

// talks配列を生成する関数（コンポーネント内で呼び出す）
export const useTalks = (messages: Message[]): Talk[] => {
  // 各メッセージの音声ファイルの長さを取得
  // フックのルールに従い、すべてのフックを同じ順序で呼び出す
  const audioDurations = messages.map((message, index) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useAudioDurationInFrames(staticFile(voicePath + message.fileName));
  });

  const talks: Talk[] = [];
  let startFrame = 0;
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const src = staticFile(voicePath + message.fileName);
    const audioDurationInFrames = audioDurations[i];
    const durationInFrames = (audioDurationInFrames || 0) + (message.intervalFrame || defaultIntervalFrame);
    talks.push({
      key: message.key,
      voice: message.voice,
      src: src,
      audioDurationInFrames: audioDurationInFrames,
      durationInFrames: durationInFrames,
      from: startFrame,
      text: message.text,
    });
    startFrame += durationInFrames;
  }
  return talks;
};