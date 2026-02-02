FROM oven/bun:alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# 强力汉化逻辑：显式覆盖并打印结果
RUN if [ -d "locales" ]; then \
    echo "Applying Chinese localization..." && \
    cp -rfv locales/* src/ && \
    echo "Localization applied successfully."; \
    fi
RUN bun run build

FROM oven/bun:alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/data/qbitwebui.db
ENV SALT_PATH=/data/.salt

EXPOSE 3000
VOLUME /data

CMD ["bun", "run", "src/server/index.ts"]
