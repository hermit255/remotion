import React from "react";
import { staticFile } from "remotion";
import { ZundaTalkV2 } from "../../templates/ZundaTalkV2";
import { ZundaTalkProps } from "../../schemas/zundaTalkSchema";
import { Message, Scenario } from "../../schemas/sequenceSchema";

/*
 * 台本
## 台本の流れ
- title: "20251211"
- description: "昔のアニメ公式サイトが“オンカジ誘導”に悪用、制作会社が注意喚起　ドメイン放棄が原因に"
- 以下のニュースサイトについてずんだもんとめたんがお互いの感想を話し合う
- 二人合わせて30回程度の会話の往復で話す

### ニュース
https://news.yahoo.co.jp/articles/321e0d70bc77e0fe65a484103154360622845df5
 */

const scenario: Scenario = require('./20251211.json');
const messages: Message[] = scenario.messages ?? [];
const backgroundImagePath = "img/bg/office.jpg";
const bgmPath = "sound/bgm/2_23_AM.mp3";

export const Z_20251211 = (_props: ZundaTalkProps): React.JSX.Element => {
  return (
    <ZundaTalkV2
      messages={messages}
      backgroundImagePath={backgroundImagePath}
      bgmPath={bgmPath}
    >
        <img 
          src={staticFile("img/misc/20251211.exif")} 
          alt="image" 
          style={{ 
            position: "absolute",
            zIndex: 1000,
            top: "50px",
            left: "500px",
          }} 
        />
    </ZundaTalkV2>
  );
};