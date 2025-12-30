import React, { useMemo } from "react";
import {
  staticFile,
  useCurrentFrame,
} from "remotion";
import { metadataSchema, type LayerMetadata, type Metadata } from "../../schemas/PsdSchema";

const basePath = "img/characters/Zundamon/";
const scale = 0.5;
const partsStyleBase: React.CSSProperties = {
  position: 'absolute',
  scale: scale,
  transformOrigin: 'top left',
};
const metadataJson = require("./metadata.json");
const metaData: Metadata = metadataSchema.parse(metadataJson);
const setKey = (children: LayerMetadata[]): Record<string, LayerMetadata> => 
  Object.fromEntries(children.map((value: LayerMetadata) => {
    const name = value.name.replace(/^[!*]/, '');
    // オブジェクトをコピーしてから使用（参照を共有しないようにする）
    // childrenは後でオブジェクトに置き換えられるが、再帰処理で参照するため保持する
    const copied = { ...value, name };
    return [name, copied];
  }));

// childrenを再帰的に処理して、imagePathを設定する関数
const processChildrenRecursively = (
  children: LayerMetadata[],
  childrenObj: Record<string, LayerMetadata>,
  pathSegments: string[]
): void => {
  if (!Array.isArray(children)) {
    return;
  }
  
  children.forEach((child: LayerMetadata) => {
    const childName = child.name.replace(/^[!*]/, '');
    const currentPath = [...pathSegments, childName];
    
    // childrenObj[childName]は元のchildオブジェクトへの参照なので、直接変更する
    const childObj = (childrenObj as any)[childName];
    if (!childObj) {
      return;
    }
    childObj.name = childName;
    
    // まず、childrenがない場合（画像ファイル）のimagePathを設定
    if (!child.children || !Array.isArray(child.children)) {
      if (!child.is_group) {
        childObj.imagePath = staticFile(
          basePath + currentPath.join("/") + ".png"
        ) as string;
      }
      return;
    }
    
    // childrenがある場合、再帰的に処理
    // まず、childrenをsetKeyでkey:value化する
    const grandChildrenObj = setKey(child.children);
    // grandChildrenObjの各要素のnameも記号なしに更新
    Object.keys(grandChildrenObj).forEach((key) => {
      const grandChildObj = grandChildrenObj[key];
      if (grandChildObj) {
        grandChildObj.name = key;
      }
    });
    // childrenプロパティを確実にオブジェクトに置き換える
    childObj.children = grandChildrenObj;
    // 再帰的に処理（元の配列child.childrenを渡し、各階層でsetKeyが適用される）
    processChildrenRecursively(child.children, grandChildrenObj, currentPath);
    
    // グループでも画像ファイルとして扱う場合（必要に応じて）
    if (!child.is_group) {
      childObj.imagePath = staticFile(
        basePath + currentPath.join("/") + ".png"
      ) as string;
    }
  });
};

// metaDataの各要素およびchildrenに対してconvertChildrenを再帰的に適用
const modMetaData: Record<string, LayerMetadata> = metaData.reduce((acc, part) => {
  // part.nameから記号を取り除く
  const partName = part.name.replace(/^[!*]/, '');
  // partをコピーしてから使用（参照を共有しないようにする）
  // childrenは後でオブジェクトに置き換えるので、一旦undefinedにする
  const partCopy = { ...part, name: partName, children: undefined as any };
  acc[partName] = partCopy;
  if (part.children && Array.isArray(part.children)) {
    const childrenObj = setKey(part.children);
    // childrenを確実にオブジェクトに置き換える
    partCopy.children = childrenObj as any;
    // 再帰的にchildrenを処理
    processChildrenRecursively(part.children, childrenObj, [partName]);
  }
  return acc;
}, {} as Record<string, LayerMetadata>);

const edamameData: LayerMetadata | undefined = modMetaData['枝豆'];
const bodyData: LayerMetadata | undefined = modMetaData['服装1'];
const eyesData: LayerMetadata | undefined = modMetaData['目'];
const eyebrowData: LayerMetadata | undefined = modMetaData['眉'];
const complexionData: LayerMetadata | undefined = modMetaData['顔色'];
const mouthData: LayerMetadata | undefined = modMetaData['口'];
const rightArmStyle: LayerMetadata | undefined = bodyData?.children?.['右腕'];
const leftArmStyle: LayerMetadata | undefined = bodyData?.children?.['左腕'];
console.log(modMetaData);

const stateDefault = {
  body: bodyData?.children?.['いつもの服'],
  edamame: edamameData?.children?.['枝豆通常'],
  rightArm: rightArmStyle?.children?.['基本'],
  leftArm: leftArmStyle?.children?.['基本'],
  whiteEye: eyesData?.children?.['目セット']?.children?.['普通白目'],
  blackEye: eyesData?.children?.['目セット']?.children?.['黒目']?.children?.['普通目'],
  singleEye: null,
  eyebrow: eyebrowData?.children?.['眉'],
  complexion: complexionData?.children?.['ほっぺ'],
  mouth: mouthData?.children?.['むふ'],
  // mouth: mouthData?.children?.['ほあー'],
}
const state = {...stateDefault};
console.log(stateDefault);

export interface ZundamonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  style?: React.CSSProperties;
  emotion?: string;
  pose?: string;
  lipSync?: number;
}

export const Zundamon: React.FC<ZundamonProps> = (props: ZundamonProps) => {
  const frame = useCurrentFrame();
  
  // stateの各要素をdomとして出力する関数（useMemoでメモ化）
  const images = useMemo((): React.JSX.Element[] => {
    if (props.emotion === 'smile') {
      state.singleEye = eyesData?.children?.['にっこり'];
      state.blackEye = null;
      state.whiteEye = null;
    } else {
      state.singleEye = stateDefault.singleEye;
      state.blackEye = stateDefault.blackEye;
      state.whiteEye = stateDefault.whiteEye;

    }

    // lipsyncが数値なら口パクを行う（ほあーとむふを不規則に繰り返す）
    if (props.lipSync && props.lipSync > 0) {
      // lipSyncは0-10の範囲で、1が最も遅く、10が最も速い
      // スピードを計算: lipSync=1の時はspeed=10（遅い）、lipSync=10の時はspeed=1（速い）
      const speed = 4 - props.lipSync;
      const cycle = Math.floor(frame / speed);
      // 不規則にするために、cycleの値を使って交互に切り替える
      // さらに不規則にするために、cycle % 3 や cycle % 5 などを使う
      const isHoa = (cycle % 3) < 2; // 3周期のうち2回はほあー、1回はむふ
      
      if (isHoa) {
        // ほあーのアニメーション（1-5などがあると仮定）
        state.mouth = mouthData?.children?.['ほあー'];
      } else {
        // むふのアニメーション（1-3などがあると仮定）
        state.mouth = stateDefault.mouth;
      }
    } else {
      state.mouth = stateDefault.mouth;
    }


    return Object.values(state)
      .filter((element): element is LayerMetadata => element !== undefined && element !== null)
      .map((element, index) => {
        const imagePath = (element as any).imagePath;
        if (!imagePath) return null;
        
        return (
          <img
            key={index}
            src={imagePath}
            alt={element.name}
            style={{
              ...partsStyleBase,
              top: `${element.top * scale}px`,
              left: `${element.left * scale}px`,
            }}
          />
        );
      })
      .filter((element): element is React.JSX.Element => element !== null);
  }, [props.emotion, props.pose, props.lipSync, frame]); // frameとlipSyncを依存配列に追加

  return (
    <div className="zundamon" {...props}>
      {images}
    </div>
  );
};
