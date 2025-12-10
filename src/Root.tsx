import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { HelloWorldMod } from "./HelloWorldMod";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { ZundaTalk, zundaTalkSchema, ZundaTalkDurationInFrames } from "./templates/ZundaTalk";
import { Message } from "./components/Sequence";

// Each <Composition> is an entry in the sidebar!

const data = require('./projects/ZundaTalk/sample.json');
const messages: Message[] = data.messages;
const data_sample_2 = require('./projects/ZundaTalk/sample_2.json');
const messages_2: Message[] = data_sample_2.messages;
const data_20251209 = require('./projects/ZundaTalk/20251209.json');
const messages_20251209: Message[] = data_20251209.messages;
const data_20251210 = require('./projects/ZundaTalk/20251210.json');
const messages_20251210: Message[] = data_20251210.messages;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />

      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorldMod"
        component={HelloWorldMod}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion Mod",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      <Composition
        id="ZundaTalk"
        component={ZundaTalk}
        durationInFrames={285}
        fps={30}
        width={1920}
        height={1080}
        schema={zundaTalkSchema}
        defaultProps={{
          messages: messages
        }}
      />

      <Composition
        id="sample-2"
        component={ZundaTalk}
        durationInFrames={6686}
        fps={30}
        width={1920}
        height={1080}
        schema={zundaTalkSchema}
        defaultProps={{
          messages: messages_2
        }}
      />

      <Composition
        id="20251209"
        component={ZundaTalk}
        durationInFrames={10037}
        fps={30}
        width={1920}
        height={1080}
        schema={zundaTalkSchema}
        defaultProps={{
          messages: messages_20251209
        }}
      />

      <Composition
        id="20251210"
        component={ZundaTalk}
        durationInFrames={8220}
        fps={30}
        width={1920}
        height={1080}
        schema={zundaTalkSchema}
        defaultProps={{
          messages: messages_20251210
        }}
      />
    </>
  );
};
