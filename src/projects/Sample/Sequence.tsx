import { staticFile } from "remotion";
import {loadFont} from '@remotion/google-fonts/TitanOne';
const {fontFamily} = loadFont(); 
import {
  Html5Audio,
  Sequence,
} from "remotion";
import { useAudioDurationInFrames } from "../../hooks/useAudioDurationInFrames";

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
// メッセージからtalksを生成する関数
const genTalks = (messages: Message[]): Talk[] => {
  const talks: Talk[] = [];
  let startFrame = 0;
  for (const message of messages) {
    const src = staticFile(voicePath + message.fileName);
    const audioDurationInFrames = useAudioDurationInFrames(src);
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
// Sequenceを生成する関数
export const genSequenceTalk: React.FC<Talk> = (talk: Talk) => {
  return (talk.from !== undefined && talk.from !== null && talk.durationInFrames && talk.src) && (
    <Sequence
      key={talk.key}
      from={talk.from}
      durationInFrames={talk.durationInFrames}
    >
      <Html5Audio src={talk.src} />
      <div style={{
        position: "absolute", bottom: "10%", width: "1920px",
        fontSize: "40px", fontWeight: "bold", textAlign: "center",
      }}>
        <span style={{ fontFamily, backgroundColor: "black", color: "white", padding: "10px", borderRadius: "10px" }}>{talk.text}</span>
      </div>
    </Sequence>
  )
};

// talks配列を生成する関数（コンポーネント内で呼び出す）
export const useTalks = (messages: Message[]): Talk[] => {
  const talks: Talk[] = genTalks(messages);;
  return talks;
};