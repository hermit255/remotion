import { staticFile } from "remotion";
import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
} from "remotion";
import { z } from "zod";
import { Zundamon } from "../Character/Zundamon";
import { Metan } from "../Character/Metan";
import { useJump } from "./hooks/useJump";

export const zundaTalkSchema = z.object({});

const opacity=1;
export const ZundaTalk: React.FC<z.infer<typeof zundaTalkSchema>> = () => {
  // ZundaTalk内部でジャンプパラメータを設定
  const bounce = useJump({
    jumpDuration: 5, // 1回のジャンプが開始から終了まで5フレーム
    jumpInterval: 25, // ジャンプ発生のインターバル25フレーム
    jumpHeight: 20, // 跳ねる高さ（ピクセル）
  });

  // A <AbsoluteFill> is just a absolutely positioned <div>!
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Html5Audio src={staticFile("sound/bgm/Morning.mp3")} />
      <AbsoluteFill style={{ opacity }}>
        <Sequence from={0}>
          <Metan style={
          {
            position: "absolute",
            bottom: "0", right: "0",
            height: "500px",
          }}/>
          <Zundamon style={
          {
            position: "absolute",
            bottom: "0", left: "0",
            height: "500px",
          }}/>
        </Sequence>
        <Sequence from={15}>
          <Metan style={
          {
            position: "absolute",
            bottom: "0", right: "0",
            height: "500px",
            transform: `translateY(${-bounce}px)`,
          }}/>
          <Zundamon style={
          {
            position: "absolute",
            bottom: "0", left: "0",
            height: "500px",
            transform: `translateY(${-bounce}px)`,
          }}/>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
