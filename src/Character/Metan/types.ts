import type { LayerMetadata } from "../../util/Psd";

// Metan固有のメタデータ型定義
export type MetanArmChildren = {
  '普通': LayerMetadata;
  '口元に指': LayerMetadata;
  'ひそひそ': LayerMetadata;
  'マイク': LayerMetadata;
  '抱える': LayerMetadata;
  'まんじゅう袋': LayerMetadata;
};

export type MetanRightArmChildren = {
  '普通': LayerMetadata;
  '指差す': LayerMetadata;
  '手をかざす': LayerMetadata;
  'まんじゅう': LayerMetadata;
};

export type MetanBodyChildren = {
  '左腕': LayerMetadata & { children: MetanArmChildren };
  '右腕': LayerMetadata & { children: MetanRightArmChildren };
  '体': LayerMetadata;
};

export type MetanEyeBlackChildren = {
  '普通目': LayerMetadata;
  '普通目2': LayerMetadata;
  'カメラ目線': LayerMetadata;
  'カメラ目線2': LayerMetadata;
  '目そらし': LayerMetadata;
  '目そらし2': LayerMetadata;
};

export type MetanEyeSetChildren = {
  '黒目': LayerMetadata & { children: MetanEyeBlackChildren };
  '普通白目': LayerMetadata;
  '見開き白目': LayerMetadata;
};

export type MetanEyeChildren = {
  '目セット': LayerMetadata & { children: MetanEyeSetChildren };
  '見上げ': LayerMetadata;
  '見上げ2': LayerMetadata;
  '目閉じ': LayerMetadata;
  '目閉じ2': LayerMetadata;
  '○○': LayerMetadata;
  '><': LayerMetadata;
  'ぐるぐる': LayerMetadata;
};

export type MetanEyebrowChildren = {
  'ごきげん': LayerMetadata;
  'ややおこ': LayerMetadata;
  'おこ': LayerMetadata;
  'こまり': LayerMetadata;
  '太眉ごきげん': LayerMetadata;
  '太眉おこ': LayerMetadata;
  '太眉こまり': LayerMetadata;
};

export type MetanComplexionChildren = {
  '普通': LayerMetadata;
  '普通2': LayerMetadata;
  '赤面': LayerMetadata;
  '青ざめ': LayerMetadata;
  '(非表示)': LayerMetadata;
  'かげり': LayerMetadata;
};

export type MetanMouthChildren = {
  'わあー': LayerMetadata;
  'ほほえみ': LayerMetadata;
  '▽': LayerMetadata;
  'にやり': LayerMetadata;
  'ぺろり': LayerMetadata;
  'お': LayerMetadata;
  'ゆ': LayerMetadata;
  '△': LayerMetadata;
  'む': LayerMetadata;
  'いー': LayerMetadata;
  'うえー': LayerMetadata;
  'んー': LayerMetadata;
  'もむー': LayerMetadata;
};

export type MetanSymbolChildren = {
  '涙': LayerMetadata;
  '汗': LayerMetadata;
};

export type MetanHairAccessoryChildren = {
  'ヘッドドレス': LayerMetadata;
  'うさみみ': LayerMetadata;
  '髪留めハート': LayerMetadata;
  '髪留めフリル': LayerMetadata;
};

export type MetanOtherClothesChildren = {
  'バニー服': LayerMetadata;
  '水着': LayerMetadata;
  'バスタオル': LayerMetadata;
  '(非表示)': LayerMetadata;
  '素体': LayerMetadata;
};

export type MetanMetadata = {
  '記号など': LayerMetadata & { children: MetanSymbolChildren };
  '前髪もみあげ': LayerMetadata;
  '頭部アクセサリ': LayerMetadata & { children: MetanHairAccessoryChildren };
  '眉': LayerMetadata & { children: MetanEyebrowChildren };
  '目': LayerMetadata & { children: MetanEyeChildren };
  '口': LayerMetadata & { children: MetanMouthChildren };
  '顔色': LayerMetadata & { children: MetanComplexionChildren };
  '白ロリ服': LayerMetadata & { children: MetanBodyChildren };
  'その他の服': LayerMetadata & { children: MetanOtherClothesChildren };
  'ツインドリル左': LayerMetadata;
  'ツインドリル右': LayerMetadata;
  '回転移動でポニテにするなど': LayerMetadata;
  [key: string]: LayerMetadata;
};

