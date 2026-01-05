import React from "react";
import { staticFile, Html5Audio, AbsoluteFill } from "remotion";
import { images, basePath as imagePath } from "../../path/images";
import { sounds, basePath as soundPath } from "../../path/sounds";
import { ZundaTalk } from "../../templates/ZundaTalk";
import { ZundaTalkProps } from "../../util/schema/zundaTalkSchema";
import { Message, Scenario } from "../../util/schema/sequenceSchema";
import { genVoiceSequence, genSubtitleSequenceV2 as genSubtitleSequence, getTalks } from "../../components/Talk";
import { getAIScript, getYoutubeDescription } from "../../util/Description";

const title = "2025mmdd";
const newsSource = "";
const description = "";
const youtubeTitle = "" + "【ずんだもん解説】";
console.log('台本', getAIScript(title, description, newsSource));
console.log('YouTubeタイトル', youtubeTitle);
console.log('YouTube説明文', getYoutubeDescription(description, newsSource));

// JSONファイルを安全に読み込む
let scenarioData: unknown;
try {
  scenarioData = require(`./messages/${title}.json`);
} catch (error) {
  console.warn(`Failed to load scenario file: ./messages/${title}.json`, error);
  scenarioData = null;
}

// scenarioが空やnullの場合の安全な処理
const scenario: Scenario = scenarioData && typeof scenarioData === 'object' && 'messages' in scenarioData
  ? (scenarioData as Scenario)
  : { title: '', description: '', messages: [] };

const messages: Message[] = scenario.messages ?? [];
const kvTitle = title;
const kvExt = "png";
const backgroundImagePath = imagePath + images.bg["1"];
const bgmPath = soundPath + sounds.bgm["1"];
export const fps = 30;

// ビルド時点でdurationを確定するため、トップレベルawaitで非同期処理を実行
const {talks, totalDurationInFrames} = await getTalks(messages, fps);

export const duration = totalDurationInFrames || 1;

export const ZundaMetanTalk = (_props: ZundaTalkProps): React.JSX.Element => {
  return (
    <AbsoluteFill>
      <Html5Audio src={staticFile(bgmPath || "sound/bgm/2_23_AM.mp3")} volume={0.1} loop />
      {talks.map((talk) => genVoiceSequence(talk))}
      <img src={staticFile(backgroundImagePath)} alt="bg" style={{}} />
      <img 
        src={staticFile(`img/misc/${kvTitle}.${kvExt}`)} 
        alt="image" 
        style={{ 
          position: "absolute",
          zIndex: 1000,
          width: "900px",
          top: "50px",
          left: "50%",
          transform: "translate(-50%, 0)",
          borderRadius: "20px",
          border: "solid 10px white",
        }} 
      />
      <ZundaTalk talks={talks} />
      {talks.map((talk) => genSubtitleSequence(talk, { top: "78%", left: "15%", width: "70%" }))}
    </AbsoluteFill>
  );
};