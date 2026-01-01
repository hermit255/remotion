/**
 * lipsyncのロジックを適用する
 * @param frame 現在のフレーム数
 * @param lipSync リップシンクの速度（0-10の範囲、1が最も遅く、10が最も速い）
 * @param openMouthCallback 口を開いている状態を作るcallback
 * @param closeMouthCallback 口を閉じている状態を作るcallback
 */
export function applyLipsync(
  frame: number,
  lipSync: number | undefined,
  openMouthCallback: () => void,
  closeMouthCallback: () => void
): void {
  // lipsyncが数値なら口パクを行う（ほあーとむふを不規則に繰り返す）
  if (lipSync && lipSync > 0) {
    // lipSyncは0-10の範囲で、1が最も遅く、10が最も速い
    // スピードを計算: lipSync=1の時はspeed=10（遅い）、lipSync=10の時はspeed=1（速い）
    const speed = 4 - lipSync;
    const cycle = Math.floor(frame / speed);
    // 不規則にするために、cycleの値を使って交互に切り替える
    // さらに不規則にするために、cycle % 3 や cycle % 5 などを使う
    const isHoa = (cycle % 3) < 2; // 3周期のうち2回はほあー、1回はむふ
    
    if (isHoa) {
      // ほあーのアニメーション（口を開く）
      openMouthCallback();
    } else {
      // むふのアニメーション（口を閉じる）
      closeMouthCallback();
    }
  } else {
    // lipsyncが無効な場合は口を閉じた状態にする
    closeMouthCallback();
  }
}

