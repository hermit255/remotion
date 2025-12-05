import { staticFile } from "remotion";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { Zundamon } from "../Character/Zundamon";
import { Metan } from "../Character/Metan";

export const zundaTalkSchema = z.object({
  jumpDuration: z.number().int().positive(), // 1回のジャンプが開始から終了まで何フレームか
  jumpInterval: z.number().int().positive(), // ジャンプ発生のインターバルフレーム
  jumpHeight: z.number().positive().optional(), // 跳ねる高さ（ピクセル）
});

const opacity=1;
export const ZundaTalk: React.FC<z.infer<typeof zundaTalkSchema>> = ({
  jumpDuration,
  jumpInterval,
  jumpHeight,
}) => {
  const frame = useCurrentFrame();

  // ジャンプ周期の計算
  const cycleLength = jumpDuration + jumpInterval; // 1サイクルの長さ（ジャンプ + 待機）
  const cyclePosition = frame % cycleLength; // 現在のサイクル内の位置

  // ジャンプ中かどうか
  const isJumping = cyclePosition < jumpDuration;
  
  // ジャンプの動き（0 → height → 0）
  const height = jumpHeight ?? 20; // デフォルト値: 20px
  const bounce = isJumping
    ? interpolate(
        cyclePosition,
        [0, jumpDuration / 2, jumpDuration],
        [0, height, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      )
    : 0;

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
