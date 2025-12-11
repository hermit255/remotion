import React from "react";
import { staticFile, Html5Audio, AbsoluteFill } from "remotion";
import { ZundaTalk } from "../../templates/ZundaTalk";
import { ZundaTalkProps } from "../../schemas/zundaTalkSchema";
import { Message, Scenario } from "../../schemas/sequenceSchema";
import { genVoiceSequence, genSubtitleSequence, getTalks } from "../../components/Talk";
import { getAIScript, getYoutubeDescription } from "../../util/Description";

const title = "2025mmdd";
const newsSource = "";
const description = "";
const youtubeTitle = "" + "【ずんだもん解説】";
console.log('台本', getAIScript(title, description, newsSource));
console.log('YouTube説明文', getYoutubeDescription(description, newsSource));
console.log('YouTubeタイトル', youtubeTitle);

const scenario: Scenario = require(`./messages/${title}.json`);
const messages: Message[] = scenario.messages ?? [];
const backgroundImagePath = "img/bg/office.jpg";
const bgmPath = "sound/bgm/2_23_AM.mp3";
export const fps = 30;

// ビルド時点でdurationを確定するため、トップレベルawaitで非同期処理を実行
const {talks, totalDurationInFrames} = await getTalks(messages, fps);

export const duration = totalDurationInFrames;

export const ZundaMetanTalk = (_props: ZundaTalkProps): React.JSX.Element => {
  return (
    <AbsoluteFill>
      <Html5Audio src={staticFile(bgmPath || "sound/bgm/2_23_AM.mp3")} volume={0.1} loop />
      {talks.map((talk) => genVoiceSequence(talk))}
      <img src={staticFile(backgroundImagePath)} alt="bg" style={{}} />
      <img 
        src={staticFile(`img/misc/${title}.exif`)} 
        alt="image" 
        style={{ 
          position: "absolute",
          zIndex: 1000,
          width: "300px",
          top: "50px",
          left: "50%",
          transform: "translate(-50%, 0)",
        }} 
      />
      <ZundaTalk talks={talks} />
      {talks.map((talk) => genSubtitleSequence(talk))}
    </AbsoluteFill>
  );
};