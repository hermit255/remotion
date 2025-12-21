# idea
## 台本を書く
### 1. 原稿を書く
```js
{
  "title" : "自己紹介とボケ",
  "description" : "会話と背景変更",
  "version": VERSION.V1,
  "nodes"; [
    {
      "type": TYPE.BG_CHANGE,
      "component": bgComponent,
    },
    {
      "type": TYPE.SOUND_CHANGE,
      "src": "/path/to/music.mp3"
    },
    {
      "type": TYPE.TALK
      "actor": ACTOR.ZUNDA,
      "txt": "こんにちは、僕はずんだもんなのだ",
    },
    {
      "type": TYPE.TALK
      "actor": ACTOR.METAN,
      "txt": "こんにちは、私は四国めたんなのだ",
    },
    {
      "type": TYPE.SOUND_CHANGE,
      "src": "/path/to/music_2.png"
    },
    {
      "type": TYPE.INTERVAL,
      "frame": 60
    },
    {
      "type": TYPE.TALK
      "actor": ACTOR.ZUNDA,
      "txt": "めたん、語尾が間違ってるのだ",
    },
    {
      "type": TYPE.INTERVAL,
      "frame": 60
    },
  ],
}
```
### 2. 台本ノードにナンバリング
- 0から始まるkeyを持った各componentノードの種を作る

### 3. うちtalkノードだけ音声出力
- 各talkノードの種からイテレートしてVOICE_BOXのAPIからwavを得る(声はACTORに依存)
- wavの長さを測定し、長さをframeに変換する
- {key: ソースファイル, 長さ} の構造を持つオブジェクトにする

### 4. 台本Emotionのcomponentとしてパースする
- 背景component
  - fromは開始から現在までのframe累計
  - frameは{次のchange} - {from}
- 音楽component
  - fromは開始から現在までのframe累計
  - frameは{次のchange} - {from}
- キャラクターcomponent
  - キャラクターの状態は直前のキャラ状態と連続させる
  - 前章で作った音声オブジェクトとマージする

### 5. 動画として出力

## 心配
- remotionの出力形式は？
- 動画とミックスして、一部に別撮りした動画を流したりできる？