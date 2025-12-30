import sys
import os
import json
from psd_tools import PSDImage

def get_layer_info(layer, index):
    """
    再構成に必要な情報を網羅的に抽出する
    """
    info = {
        "name": layer.name,
        "index": index,                   # 重なり順の管理用
        "left": layer.left,
        "right": layer.right,
        "top": layer.top,
        "bottom": layer.bottom,
        "height": layer.height,
        "width": layer.width,
        "opacity": layer.opacity,         # 不透明度 (0-255)
        "blend_mode": layer.blend_mode.name.lower(), # 描画モード (normal, multiply等)
        "visible": layer.is_visible(),    # 本来の表示状態
        "is_group": layer.is_group()      # グループかどうかの判定
    }

    if layer.is_group():
        child_layers = list(layer)
        child_layers.reverse()
        # 子要素にもインデックスを振って再帰処理
        info["children"] = [get_layer_info(child, i) for i, child in enumerate(child_layers)]
    
    return info

def save_layer(layer, current_path):
    """
    レイヤーを再帰的に処理してPNG保存する関数
    """
    clean_name = "".join([c for c in layer.name if c.isalnum() or c in (' ', '_', '-')]).strip()
    if not clean_name:
        clean_name = "layer"
    
    node_name = clean_name

    if layer.is_group():
        new_path = os.path.join(current_path, node_name)
        os.makedirs(new_path, exist_ok=True)
        print(f"Creating Directory: {new_path}")
        
        child_layers = list(layer)
        child_layers.reverse()
        
        for child in child_layers:
            save_layer(child, new_path)
    else:
        # 非表示レイヤーも出力対象にする
        if not layer.is_visible():
            layer.visible = True
        
        # 画像サイズがある場合のみ保存
        if layer.width > 0 and layer.height > 0:
            file_path = os.path.join(current_path, f"{node_name}.png")
            layer.composite().save(file_path)
            print(f"Exported: {file_path}")

def export():
    if len(sys.argv) < 2:
        print("Usage: docker-compose run --rm psd-exporter <filename_without_ext>")
        return

    target_name = sys.argv[1]
    psd_path = f"/app/input/{target_name}.psd"
    output_root = f"/app/output/{target_name}"
    
    if not os.path.exists(psd_path):
        print(f"Error: {psd_path} not found.")
        return

    print(f"Loading {psd_path}...")
    psd = PSDImage.open(psd_path)
    os.makedirs(output_root, exist_ok=True)

    # 1. 座標情報の解析とJSON出力
    print("Extracting metadata...")
    root_layers = list(psd)
    root_layers.reverse()
    
    metadata = [get_layer_info(layer, index) for index, layer in enumerate(root_layers)]
    
    json_path = os.path.join(output_root, "metadata.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=4)
    print(f"Metadata saved: {json_path}")

    # 2. 各レイヤーのPNG出力
    for layer in root_layers:
        save_layer(layer, output_root)

if __name__ == "__main__":
    export()