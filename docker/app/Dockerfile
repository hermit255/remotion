FROM node:20-slim

WORKDIR /app

# 基本的なツールをインストール（必要に応じて）
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# デフォルトコマンド（docker-compose.ymlで上書き可能）
CMD ["npm", "run", "dev"]

