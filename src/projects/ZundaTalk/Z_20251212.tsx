import React from "react";
import { staticFile } from "remotion";
import { ZundaTalkV2 } from "../../templates/ZundaTalkV2";
import { ZundaTalkProps } from "../../util/schema/zundaTalkSchema";
import { Message, Scenario } from "../../util/schema/sequenceSchema";

/*
 * 台本
## 台本の流れ
- title: "20251212"
- description: "マウスコンピューターが「パソコンは早めに買って」とアナウンス　Webサイトは接続困難に【ずんだもん解説】"
- 以下のニュースサイトについてずんだもんとめたんがお互いの感想を話し合う
- 二人合わせて30回程度の会話の往復で話す

### ニュース
https://news.yahoo.co.jp/articles/9a68a7c2d5f866a42e0c004ebcec92c5cfa786a1

--- 

▼この動画について▼
以下のニュースをテーマとした解説動画です
マウスコンピューターが「パソコンは早めに買って」とアナウンス　Webサイトは接続困難に
https://news.yahoo.co.jp/articles/9a68a7c2d5f866a42e0c004ebcec92c5cfa786a1

▼著作権について▼
動画内で使用している画像の著作権は全て権利所有者様に帰属します。

▼お借りしている素材▼
VOICEVOX:ずんだもん
VOICEVOX:四国めたん
立ち絵(坂本アヒル様)：https://twitter.com/sakamoto_ahr
みんちりえ：https://min-chi.material.jp/
しゃろう：https://www.dova-s.jp/
 */

const scenario: Scenario = require('./20251212.json');
const messages: Message[] = scenario.messages ?? [];
const backgroundImagePath = "img/bg/office.jpg";
const bgmPath = "sound/bgm/2_23_AM.mp3";

export const Z_20251212 = (_props: ZundaTalkProps): React.JSX.Element => {
  return (
    <ZundaTalkV2
      messages={messages}
      backgroundImagePath={backgroundImagePath}
      bgmPath={bgmPath}
    >
        <img 
          src={staticFile("img/misc/20251212.jpg")} 
          alt="image" 
          style={{ 
            position: "absolute",
            zIndex: 1000,
            width: "900px",
            top: "50px",
            left: "50%",
            transform: "translate(-50%, 0)",
          }} 
        />
    </ZundaTalkV2>
  );
};