import React from "react";
import { staticFile, Html5Audio, AbsoluteFill } from "remotion";
import { images, basePath as imagePath } from "../../path/images";
import { sounds, basePath as soundPath } from "../../path/sounds";
import { ZundaTalk } from "../../templates/ZundaTalk";
import { ZundaTalkProps } from "../../util/schema/zundaTalkSchema";
import { Message, Scenario } from "../../util/schema/sequenceSchema";
import { genVoiceSequence, genSubtitleSequence, getTalks } from "../../components/Talk";
import { getAIScript, getYoutubeDescription } from "../../util/Description";

const title = "20251219";
const newsSource = "https://news.yahoo.co.jp/articles/930580eba30dffe70e3351c05bb8eef3fdee8bb3";
const description = "大手声優事務所、AI音声会社と業務提携　81プロデュース×イレブンラボ「声の不正利用」業界の課題解決へ";
const youtubeTitle = "大手声優事務所、AI音声会社と業務提携" + "【ずんだもん解説】";
console.log('台本', getAIScript(title, description, newsSource));
console.log('YouTubeタイトル', youtubeTitle);
console.log('YouTube説明文', getYoutubeDescription(description, newsSource));

const scenario: Scenario = require(`./messages/${title}.json`);
const messages: Message[] = scenario.messages ?? [];
const kvTitle = title;
const kvExt = "png";
const backgroundImagePath = imagePath + images.bg["1"];
const bgmPath = soundPath + sounds.bgm["1"];
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
          width: "900px",
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