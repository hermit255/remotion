import React from "react";
import { staticFile } from "remotion";
import { loadFont } from '@remotion/google-fonts/ZenMaruGothic';
import {
  Html5Audio,
  Sequence,
} from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { Message, Talk } from "../util/schema/sequenceSchema";

const {fontFamily} = loadFont(); 
const voicePath: string = "sound/voice/";
const defaultIntervalFrame: number = 10;
// Sequenceを生成する関数
export const genVoiceSequence = (talk: Talk): React.JSX.Element | null => {
  if (talk.durationInFrames === null) return null;
  return (
    <Sequence
      key={talk.key + "voice"}
      from={talk.from}
      durationInFrames={talk.durationInFrames}
    >
      <Html5Audio src={talk.src} volume={1.0} />
    </Sequence>
  )
};

export const genSubtitleSequence = (talk: Talk): React.JSX.Element | null => {
  if (talk.durationInFrames === null) return null;
  return (
    <Sequence
      key={talk.key + "subtitle"}
      from={talk.from}
      durationInFrames={talk.durationInFrames}
    >
      <div style={{
        position: "absolute", bottom: "10%", width: "1920px",
        display: "flex", justifyContent: "center",
      }}>
        <span style={{
          fontSize: "50px", fontWeight: "bold",
          maxWidth: "95%", margin: "0 auto", padding: "10px", borderRadius: "10px",
          fontFamily, color: "white", backgroundColor: "rgb(0, 0, 0, 0.7)"
        }}>
          {talk.text}
        </span>
      </div>
    </Sequence>
  )
};

export const genSubtitleSequenceV2 = (talk: Talk): React.JSX.Element | null => {
  if (talk.durationInFrames === null) return null;

  let textColor = "white";
  if (talk.voice === 3) {
    textColor = "#339933";
  } else if (talk.voice === 2) {
    textColor = "#E44175";
  }
  return (
    <Sequence
      key={talk.key + "subtitle"}
      from={talk.from}
      durationInFrames={talk.durationInFrames}
    >
      <div style={{
        position: "absolute", bottom: "1%", left: "15%", width: "70%",
        display: "flex", justifyContent: "center",
      }}>
        <span style={{
          fontSize: "50px", fontWeight: "bold",
          textShadow: "1px 1px 0 #FFF, -1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px -1px 0 #FFF, 0px 1px 0 #FFF,  0-1px 0 #FFF, -1px 0 0 #FFF, 1px 0 0 #FFF",
          maxWidth: "95%", margin: "0 auto", padding: "10px", borderRadius: "10px",
          fontFamily, color: textColor , backgroundColor: "rgb(255, 255, 255, 0.2)"
        }}>
          {talk.text}
        </span>
      </div>
    </Sequence>
  )
};

export const getTalks = async (messages: Message[], fps: number): Promise<{talks: Talk[], totalDurationInFrames: number}> => {
  // すべての音声ファイルの長さを並列で取得
  const audioDurationPromises = messages.map(async (message) => {
    const src = staticFile(voicePath + message.fileName);
    try {
      const durationInSeconds = await getAudioDurationInSeconds(src);
      return {
        src,
        durationInSeconds,
        message,
      };
    } catch (error) {
      console.error(`Failed to get audio duration for ${src}:`, error);
      return {
        src,
        durationInSeconds: null,
        message,
      };
    }
  });
  const audioData = await Promise.all(audioDurationPromises);

  // talks配列を生成
  const generatedTalks: Talk[] = [];
  let startFrame = 0;

  for (const data of audioData) {
    const audioDurationInFrames = Math.ceil(data.durationInSeconds * fps);
    const durationInFrames = audioDurationInFrames + (data.message.intervalFrame || defaultIntervalFrame);
    
    generatedTalks.push({
      key: data.message.key,
      voice: data.message.voice,
      src: data.src,
      audioDurationInFrames: audioDurationInFrames,
      durationInFrames: durationInFrames,
      from: startFrame,
      text: data.message.text,
      emotion: data.message.emotion,
    });
    startFrame += durationInFrames;
  }

  return {
    talks: generatedTalks,
    totalDurationInFrames: startFrame,
  };
};
