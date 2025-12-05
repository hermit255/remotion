import { staticFile } from "remotion";
import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
} from "remotion";
import { Zundamon } from "../Character/Zundamon";
import { Metan } from "../Character/Metan";

const opacity=1;
export const ZundaTalk: React.FC = ({}) => {
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
            }}>
            <Metan />
          </div>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
