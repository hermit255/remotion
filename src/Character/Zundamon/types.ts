import type { LayerMetadata } from "../../util/Psd";

// Zundamon固有のメタデータ型定義
export type ZundamonEdamameChildren = {
  '枝豆通常': LayerMetadata;
  '枝豆萎え': LayerMetadata;
  'パーカー(裏地とセットで使用)': LayerMetadata;
};

export type ZundamonBodyArmChildren = {
  '基本': LayerMetadata;
  '腰': LayerMetadata;
  '手を挙げる': LayerMetadata;
  '口元': LayerMetadata;
  '苦しむ': LayerMetadata;
  '指差し'?: LayerMetadata;
  'マイク'?: LayerMetadata;
  '考える'?: LayerMetadata;
  'ひそひそ'?: LayerMetadata;
  '胸元'?: LayerMetadata;
  '(非表示)': LayerMetadata;
};

export type ZundamonBodyChildren = {
  '右腕': LayerMetadata & { children: ZundamonBodyArmChildren };
  '左腕': LayerMetadata & { children: ZundamonBodyArmChildren };
  'いつもの服': LayerMetadata;
  '制服': LayerMetadata;
};

export type ZundamonEyeBlackChildren = {
  '普通目': LayerMetadata;
  '普通目2': LayerMetadata;
  '普通目3': LayerMetadata;
  'カメラ目線': LayerMetadata;
  'カメラ目線2': LayerMetadata;
  'カメラ目線3': LayerMetadata;
  '目逸らし': LayerMetadata;
  '目逸らし2': LayerMetadata;
  '目逸らし3': LayerMetadata;
};

export type ZundamonEyeSetChildren = {
  '黒目': LayerMetadata & { children: ZundamonEyeBlackChildren };
  '普通白目': LayerMetadata;
  'ジト白目': LayerMetadata;
  '見開き白目': LayerMetadata;
};

export type ZundamonEyeChildren = {
  '目セット': LayerMetadata & { children: ZundamonEyeSetChildren };
  '上向き': LayerMetadata;
  '上向き2': LayerMetadata;
  '上向き3': LayerMetadata;
  '細め目ハート': LayerMetadata;
  '細め目': LayerMetadata;
  'ジト目': LayerMetadata;
  'なごみ目': LayerMetadata;
  'にっこり': LayerMetadata;
  'にっこり2': LayerMetadata;
  'UU': LayerMetadata;
  '><': LayerMetadata;
  '〇〇': LayerMetadata;
  'ぐるぐる': LayerMetadata;
};

export type ZundamonEyebrowChildren = {
  '普通眉': LayerMetadata;
  '怒り眉': LayerMetadata;
  '上がり眉': LayerMetadata;
  '困り眉1': LayerMetadata;
  '困り眉2': LayerMetadata;
};

export type ZundamonComplexionChildren = {
  'ほっぺ': LayerMetadata;
  'ほっぺ2': LayerMetadata;
  'ほっぺ赤め': LayerMetadata;
  '青ざめ': LayerMetadata;
  '(非表示)': LayerMetadata;
  'かげり': LayerMetadata;
};

export type ZundamonMouthChildren = {
  'むー': LayerMetadata;
  'ゆ': LayerMetadata;
  'お': LayerMetadata;
  'おほお': LayerMetadata;
  'はへえ': LayerMetadata;
  'んー': LayerMetadata;
  'んへー': LayerMetadata;
  'んあー': LayerMetadata;
  '△': LayerMetadata;
  'むふ': LayerMetadata;
  'ほー': LayerMetadata;
  'ほあ': LayerMetadata;
  'ほあー': LayerMetadata;
};

export type ZundamonMetadata = {
  '枝豆': LayerMetadata & { children: ZundamonEdamameChildren };
  '服装1': LayerMetadata & { children: ZundamonBodyChildren };
  '目': LayerMetadata & { children: ZundamonEyeChildren };
  '眉': LayerMetadata & { children: ZundamonEyebrowChildren };
  '顔色': LayerMetadata & { children: ZundamonComplexionChildren };
  '口': LayerMetadata & { children: ZundamonMouthChildren };
  [key: string]: LayerMetadata;
};

