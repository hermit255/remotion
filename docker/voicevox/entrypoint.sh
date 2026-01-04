#!/bin/bash
set -e

# デバッグ情報を出力
echo "Entrypoint script started"
echo "Arguments: $@"

# VOICEVOXエンジンのデフォルトコマンド
# 元のイメージのCMD: gosu user /opt/voicevox_engine/run --use_gpu --host 0.0.0.0
DEFAULT_CMD=("gosu" "user" "/opt/voicevox_engine/run" "--use_gpu" "--host" "0.0.0.0")

# VOICEVOXエンジンをバックグラウンドで起動
echo "Starting VOICEVOX engine..."
if [ $# -eq 0 ]; then
  # CMDが指定されていない場合、デフォルトのコマンドを実行
  echo "Using default VOICEVOX engine command: ${DEFAULT_CMD[*]}"
  "${DEFAULT_CMD[@]}" &
else
  echo "Using provided command: $*"
  "$@" &
fi

ENGINE_PID=$!
echo "VOICEVOX engine started with PID: $ENGINE_PID"

# VOICEVOXエンジンが起動するまで待機（タイムアウト付き）
echo "Waiting for VOICEVOX engine to start..."
MAX_WAIT=180  # 最大180秒待機（GPU初期化に時間がかかる場合がある）
WAIT_TIME=0
while ! curl -f http://localhost:50021/speakers > /dev/null 2>&1; do
  sleep 2
  WAIT_TIME=$((WAIT_TIME + 2))
  
  # プロセスの生存確認
  if ! kill -0 $ENGINE_PID 2>/dev/null; then
    echo "Error: VOICEVOX engine process died unexpectedly"
    exit 1
  fi
  
  if [ $WAIT_TIME -ge $MAX_WAIT ]; then
    echo "Error: VOICEVOX engine did not start within $MAX_WAIT seconds"
    echo "Process is running, but API is not responding"
    exit 1
  fi
  
  if [ $((WAIT_TIME % 10)) -eq 0 ]; then
    echo "Still waiting... (${WAIT_TIME}s elapsed)"
  fi
done

echo "VOICEVOX engine is ready (took ${WAIT_TIME}s)"

# 辞書を登録する関数
register_dictionary() {
  local dict_file=$1
  local dict_name=$2
  
  if [ ! -f "$dict_file" ]; then
    echo "Info: $dict_name not found, skipping"
    return 1
  fi
  
  # dict.jsonが空でないか確認（空のオブジェクト{}でない場合のみ登録）
  DICT_SIZE=$(cat "$dict_file" | jq 'if type == "object" then length else 0 end' 2>/dev/null || echo "0")
  if [ "$DICT_SIZE" != "0" ] && [ "$DICT_SIZE" != "null" ]; then
    echo "Registering dictionary from $dict_name..."
    # /import_user_dictエンドポイントを使用（override=trueで上書き）
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:50021/import_user_dict?override=true" \
      -H "Content-Type: application/json" \
      -d @"$dict_file")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
      echo "Dictionary registered successfully from $dict_name"
      return 0
    else
      echo "Warning: Failed to register dictionary from $dict_name (HTTP $HTTP_CODE)"
      echo "$RESPONSE" | head -n -1
      return 1
    fi
  else
    echo "Info: $dict_name is empty, skipping dictionary registration"
    return 1
  fi
}

# volumeに辞書がない場合、初期辞書ファイルを読み込む
if [ -f /app/dict.json ]; then
  register_dictionary /app/dict.json "/app/dict.json"
fi

# フォアグラウンドでプロセスを待機
echo "VOICEVOX engine is running. Waiting for process..."
wait $ENGINE_PID
