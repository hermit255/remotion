import React from "react";
import { staticFile, Html5Audio, AbsoluteFill } from "remotion";
import { ZundaTalkV3 } from "../../templates/ZundaTalkV3";
import { ZundaTalkProps } from "../../schemas/zundaTalkSchema";
import { Message, Scenario } from "../../schemas/sequenceSchema";
import { genVoiceSequence, genSubtitleSequence, getTalks } from "../../components/Talk";
import { getAIScript, getYoutubeDescription } from "../../util/Description";

const title = "20251213";
const newsSource = "https://news.yahoo.co.jp/articles/207527d33b55fdb1de0550b3be5c43ce39f409e9";
const description = "「画材の会社が...」商品ポスターに生成AI使用　サクラクレパスが謝罪「再発防止に向けてチェック体制を強化」";
console.log(getAIScript(title, description, newsSource));
console.log(getYoutubeDescription(description, newsSource));

const scenario: Scenario = require(`./${title}.json`);
const messages: Message[] = scenario.messages ?? [];
const backgroundImagePath = "img/bg/office.jpg";
const bgmPath = "sound/bgm/2_23_AM.mp3";
export const fps = 30;

// ビルド時点でdurationを確定するため、トップレベルawaitで非同期処理を実行
const {talks, totalDurationInFrames} = await getTalks(messages, fps);

export const duration = totalDurationInFrames;

export const Z_20251213 = (_props: ZundaTalkProps): React.JSX.Element => {
  console.log(totalDurationInFrames);
  return (

    <AbsoluteFill>
      <Html5Audio src={staticFile(bgmPath || "sound/bgm/2_23_AM.mp3")} volume={0.1} loop />
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
      <ZundaTalkV3 talks={talks} />
      {talks.map((talk) => genVoiceSequence(talk))}
      {talks.map((talk) => genSubtitleSequence(talk))}
    </AbsoluteFill>
  );
};