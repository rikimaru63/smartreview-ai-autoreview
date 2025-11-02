FROM node:18-alpine

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# アプリケーションコードのコピー
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
