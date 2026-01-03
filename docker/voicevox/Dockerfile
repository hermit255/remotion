FROM voicevox/voicevox_engine:nvidia-latest

# curlとjqをインストール（辞書ファイルの検証用）
RUN apt-get update && apt-get install -y curl jq && rm -rf /var/lib/apt/lists/*

# エントリーポイントスクリプトをコピー
COPY docker/voicevox/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 元のイメージのENTRYPOINTとCMDを継承するために、ENTRYPOINTのみを上書き
# CMDは元のイメージから継承される
ENTRYPOINT ["/entrypoint.sh"]
