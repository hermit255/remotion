import React, { useEffect, useRef } from "react";
import { staticFile, Html5Audio, AbsoluteFill } from "remotion";
import { ZundaTalk } from "../../templates/ZundaTalk";
import { ZundaTalkProps } from "../../schemas/zundaTalkSchema";
import { Message, Scenario } from "../../schemas/sequenceSchema";
import { genVoiceSequence, genSubtitleSequence, getTalks } from "../../components/Talk";
import { getAIScript, getYoutubeDescription } from "../../util/Description";

const title = "20251215";
const newsSource = "https://news.yahoo.co.jp/articles/6bcbf37f7c2a2f5dc5b2de1dbd2b621ade96e22c";
const description = "「トラックドライバーのソウルフード」「東京23区にはあえて出店しない」 ラーメンチェーン《山岡家》が全国区で老若男女に愛されているワケ";
const youtubeTitle = "山岡家のファンは若者や子連れのファミリー客にまで拡大" + "【ずんだもん解説】";
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

import Psd from "@webtoon/psd";
export const ZundaMetanTalk = (_props: ZundaTalkProps): React.JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderPsd = async () => {
      // const psdStaticPath = "img/misc/znd.psd";
      // const psdStaticPath = "img/misc/sample.psd";
      const psdStaticPath = "img/misc/sample.psd";
      const res = await fetch(staticFile(psdStaticPath));
      const arrayBuffer = await res.arrayBuffer();
      const psd = await Psd.parse(arrayBuffer);
      const compositeBuffer = await psd.composite();
      const canvas = canvasRef.current;
      const image = new ImageData(
        new Uint8ClampedArray(compositeBuffer),
        psd.width,
        psd.height
      );
      if (canvas) {
        const scale = 0.5; // 縮小率（50%）
        canvas.width = psd.width * scale;
        canvas.height = psd.height * scale;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(scale, scale); // スケールを適用
          ctx.putImageData(image, 0, 0);
        }
      };
    };
    renderPsd();
  }, []);

  return (
    <AbsoluteFill>
      <Html5Audio src={staticFile(bgmPath || "sound/bgm/2_23_AM.mp3")} volume={0.1} loop />
      <div ref={canvasRef} />
      {talks.map((talk) => genVoiceSequence(talk))}
      <img src={staticFile(backgroundImagePath)} alt="bg" style={{}} />
      <img 
        src={staticFile(`img/misc/${title}.png`)} 
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
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 500 }} />
      <ZundaTalk talks={talks} />
      {talks.map((talk) => genSubtitleSequence(talk))}
    </AbsoluteFill>
  );
};