export const getAIScript = (title: string, description: string, newsSource: string): string => `
## 台本の流れ
- title: "${title}"
- description: "${description}"
- 以下のニュースサイトについてずんだもんとめたんがお互いの感想を話し合う
- 二人合わせて30回程度の会話の往復で話す

### ニュース
${newsSource}
`;

export const getYoutubeDescription = (description: string, newsSource: string): string => `
▼この動画について▼
以下のニュースをテーマとした解説動画です
${description}
${newsSource}

▼著作権について▼
動画内で使用している画像の著作権は全て権利所有者様に帰属します。

▼お借りしている素材▼
VOICEVOX:ずんだもん
VOICEVOX:四国めたん
立ち絵(坂本アヒル様)：https://twitter.com/sakamoto_ahr
みんちりえ：https://min-chi.material.jp/
しゃろう：https://www.dova-s.jp/
`;