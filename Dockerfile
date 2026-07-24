# dataraw.jp — Next.js アプリを Docker で常駐配信する。
# 他アプリ(concafe-app 等)と同じ node:20-slim 2段ビルド方式。
# better-sqlite3 はネイティブモジュールなのでビルド段に python/make/g++ を入れる。

FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update && \
    apt-get install -y python3 make g++ --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# ネットワーク不安定時用: リトライ・タイムアウト延長
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci

COPY . .

# ビルド時メモリ上限（ホストRAMに合わせる。他アプリと同じ 1536）
ENV NODE_OPTIONS=--max-old-space-size=1536
ENV NEXT_TELEMETRY_DISABLED=1

# GA4 測定ID（ビルド時に埋め込む。未指定ならクライアントでGAは無効）
ARG NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID

RUN npm run build

# ── 実行イメージ ──
FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# better-sqlite3 はビルド段でコンパイル済み。同一ベースなので node_modules をそのまま流用
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./

# コメントSQLiteの永続先（本番は /data をボリュームマウント）
RUN mkdir -p /data
ENV COMMENTS_DB_DIR=/data

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["npm", "start"]
