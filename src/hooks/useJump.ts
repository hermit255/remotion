import { interpolate, useCurrentFrame } from "remotion";

/**
 * 汎用的なジャンプアニメーションフック
 * 用例:
 * const bounce = useJump({jumpDuration: 5, jumpInterval: 25, jumpHeight: 20});
 * <div style={{ transform: `translateY(${-bounce}px)` }}>
 * 
 * @param options - ジャンプアニメーションの設定
 * @param options.jumpDuration - 1回のジャンプが開始から終了まで何フレームか
 * @param options.jumpInterval - ジャンプ発生のインターバルフレーム
 * @param options.jumpHeight - 跳ねる高さ（ピクセル、デフォルト: 20）
 * @returns ジャンプの高さ（ピクセル）。0からjumpHeightまでの値を返す
 */
export const useJump = (options: {
  jumpDuration: number;
  jumpInterval: number;
  jumpHeight?: number;
}) => {
  const frame = useCurrentFrame();
  const { jumpDuration, jumpInterval, jumpHeight = 20 } = options;

  // ジャンプ周期の計算
  const cycleLength = jumpDuration + jumpInterval; // 1サイクルの長さ（ジャンプ + 待機）
  const cyclePosition = frame % cycleLength; // 現在のサイクル内の位置

  // ジャンプ中かどうか
  const isJumping = cyclePosition < jumpDuration;
  
  // ジャンプの動き（0 → height → 0）
  const bounce = isJumping
    ? interpolate(
        cyclePosition,
        [0, jumpDuration / 2, jumpDuration],
        [0, jumpHeight, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      )
    : 0;

  return bounce;
};


