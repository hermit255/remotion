import { useAudioData } from "@remotion/media-utils";
import { useVideoConfig } from "remotion";

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

/**
 * 音声ファイルの長さをフレーム数に変換するフック
 * 用例:
 * const audioSrc = staticFile("sound/voice/sample/sample_1.wav");
 * const durationInFrames = useAudioDurationInFrames(audioSrc);
 * <Sequence durationInFrames={durationInFrames}>...</Sequence>
 * 
 * @param audioSrc - 音声ファイルのパス（staticFile()で取得した値）
 * @param fallbackFrames - 読み込み中の場合のデフォルトフレーム数（デフォルト: 100）
 * @returns 音声ファイルの長さをフレーム数に変換した値
 */
export const useAudioDurationInFrames = (
  audioSrc: string,
  fallbackFrames: number = 100
): number => {
  const { fps } = useVideoConfig();
  const audioData = useAudioData(audioSrc);
  
  return calculateAudioDurationInFrames(
    audioData?.durationInSeconds,
    fps,
    fallbackFrames
  );
};

