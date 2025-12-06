import { staticFile } from "remotion";
import {loadFont} from '@remotion/google-fonts/TitanOne';
const {fontFamily} = loadFont(); 
import {
  Html5Audio,
  Sequence,
} from "remotion";
import { useAudioDurationInFrames } from "../../hooks/useAudioDurationInFrames";

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
export const useSequence = (): Talk[] => {
  // 手動入力想定
  const talks: Talk[] = [
    {
      key: "sample_1",
      voice: 3,
      src: staticFile("sound/voice/sample/sample_1.wav"),
      audioDurationInFrames: useAudioDurationInFrames(staticFile("sound/voice/sample/sample_1.wav")),
      text: "こんにちは、僕はずんだもんなのだ",
    },
    {
      key: "sample_2",
      voice: 2,
      src: staticFile("sound/voice/sample/sample_2.wav"),
      audioDurationInFrames: useAudioDurationInFrames(staticFile("sound/voice/sample/sample_2.wav")),
      text: "こんにちは、私は四国めたんなのだ",
    },
    {
      key: "sample_3",
      voice: 3,
      src: staticFile("sound/voice/sample/sample_3.wav"),
      audioDurationInFrames: useAudioDurationInFrames(staticFile("sound/voice/sample/sample_3.wav")),
      text: "めたん、語尾が間違ってるのだ",
    },
  ];

  // fromとdurationInFramesを計算
  let currentFrame = 0;
  for (const [key] of talks.entries()) {
    const audioDurationInFrames: number = talks[key].audioDurationInFrames;
    talks[key].from = currentFrame;
    talks[key].durationInFrames = (audioDurationInFrames || 0) + (talks[key].intervalFrame || defaultIntervalFrame);
    currentFrame += talks[key].durationInFrames || 0;
  }

  return talks;
};