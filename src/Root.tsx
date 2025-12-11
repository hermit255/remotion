import "./index.css";
import { Composition } from "remotion";
import { ZundaTalk, zundaTalkSchema } from "./templates/ZundaTalk";
import { Message } from "./schemas/sequenceSchema";
import { Z_20251211 } from "./projects/ZundaTalk/Z_20251211";

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

      <Composition
        id="20251211"
        component={Z_20251211}
        durationInFrames={7582}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
