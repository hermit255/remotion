/**
 * 音声データの長さ（秒）とfpsからフレーム数を計算する通常の関数
 * 
 * @param durationInSeconds - 音声ファイルの長さ（秒）
 * @param fps - フレームレート
 * @param fallbackFrames - durationInSecondsがnull/undefinedの場合のデフォルトフレーム数
 * @returns 音声ファイルの長さをフレーム数に変換した値
 */
export const calculateAudioDurationInFrames = (
  durationInSeconds: number | null | undefined,
  fps: number,
  fallbackFrames: number = 100
): number => {
  return durationInSeconds
    ? Math.ceil(durationInSeconds * fps)
    : fallbackFrames;
};
