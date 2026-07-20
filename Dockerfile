FROM node:22.23.1-bookworm-slim AS build

WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY index.html vite.config.mjs ./
COPY public ./public
COPY src ./src
RUN pnpm build

FROM node:22.23.1-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=8080 \
    DATA_DIR=/data \
    REQUIRE_EXISTING_STORE=true
WORKDIR /app
RUN useradd --system --uid 10001 --home /app --shell /usr/sbin/nologin app
COPY --from=build --chown=app:app /app/dist ./dist
COPY --chown=app:app server.mjs ./server.mjs
USER app
EXPOSE 8080
CMD ["node", "server.mjs"]
