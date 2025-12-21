import React from "react";
import { staticFile, Html5Audio, AbsoluteFill } from "remotion";
import { ZundaTalk } from "../../templates/ZundaTalk";
import { ZundaTalkProps } from "../../schemas/zundaTalkSchema";
import { Message, Scenario } from "../../schemas/sequenceSchema";
import { genVoiceSequence, genSubtitleSequence, getTalks } from "../../components/Talk";
import { getAIScript, getYoutubeDescription } from "../../util/Description";

const title = "20251218";
const newsSource = "https://news.yahoo.co.jp/articles/882448996fcf31dbec13dae1a6e864d29b05f709";
const description = "スマホ新法、きょう施行　Google Playの“課金”周りはどう変わる？　変更点を整理";
const youtubeTitle = "GoogleとAppleは儲けすぎ？スマホ新法施行" + "【ずんだもん解説】";
console.log('台本', getAIScript(title, description, newsSource));
console.log('YouTube説明文', getYoutubeDescription(description, newsSource));
console.log('YouTubeタイトル', youtubeTitle);

const scenario: Scenario = require(`./messages/${title}.json`);
const messages: Message[] = scenario.messages ?? [];
const kvTitle = title;
const kvExt = "png";
const backgroundImagePath = "img/bg/building_day.jpg";
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