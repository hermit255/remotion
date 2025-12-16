import React from "react";
import { staticFile, Html5Audio, AbsoluteFill } from "remotion";
import { ZundaTalk } from "../../templates/ZundaTalk";
import { ZundaTalkProps } from "../../schemas/zundaTalkSchema";
import { Message, Scenario } from "../../schemas/sequenceSchema";
import { genVoiceSequence, genSubtitleSequence, getTalks } from "../../components/Talk";
import { getAIScript, getYoutubeDescription } from "../../util/Description";

const title = "20251216";
const newsSource = "https://ascii.jp/elem/000/004/360/4360253/";
const description = "アマゾン、電子書籍をダウンロード可能に　一部Kindle本から開始";
const youtubeTitle = "サービスが終わっても安心？一部のKindleの電子書籍がダウンロード可能に" + "【ずんだもん解説】";
console.log('台本', getAIScript(title, description, newsSource));
console.log('YouTube説明文', getYoutubeDescription(description, newsSource));
console.log('YouTubeタイトル', youtubeTitle);

const scenario: Scenario = require(`./messages/${title}.json`);
const messages: Message[] = scenario.messages ?? [];
const kvTitle = title;
const kvExt = "webp";
const backgroundImagePath = "img/bg/room.jpg";
const bgmPath = "sound/bgm/Morning.mp3";
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
        src={staticFile(`img/misc/${kvTitle}.${kvExt}`)} 
        alt="image" 
        style={{ 
          position: "absolute",
          zIndex: 1000,
          width: "600px",
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