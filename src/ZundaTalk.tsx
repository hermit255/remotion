import { staticFile } from "remotion";
import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Zundamon } from "../Character/Zundamon";
import { Metan } from "../Character/Metan";

const opacity=1;
export const ZundaTalk: React.FC = ({}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 上下に跳ねる動き（周期的な動き）
  // 1秒間に2回跳ねる（fps * 2 = 1秒間のフレーム数）
  const bounceSpeed = 2; // 1秒間の跳ね回数
  const bounceHeight = 20; // 跳ねる高さ（ピクセル）
  const bounce = Math.sin((frame / fps) * bounceSpeed * Math.PI * 2) * bounceHeight;

  // A <AbsoluteFill> is just a absolutely positioned <div>!
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Html5Audio src={staticFile("sound/bgm/Morning.mp3")} />
      <AbsoluteFill style={{ opacity }}>
        <Sequence from={0}>
          <div style={
            {
              position:
                "absolute", bottom: "20%", right: "0",
                width: "400px", height: "400px",
            }}>
            <Zundamon />
          </div>
          <div style={
            {
              position:
                "absolute", bottom: "27%", left: "0",
                width: "400px", height: "400px",
              transform: `translateY(${-bounce}px)`,
            }}>
            <Metan />
          </div>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
