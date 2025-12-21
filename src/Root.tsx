import "./index.css";
import { Composition } from "remotion";
import { ZundaMetanTalk, duration, fps } from "./projects/ZundaTalk/Z_20251220";
// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ZundaMetanTalk"
        component={ZundaMetanTalk}
        durationInFrames={duration}
        fps={fps}
        width={1920}
        height={1080}
      />
    </>
  );
};
