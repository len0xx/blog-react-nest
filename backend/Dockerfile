FROM node:20-alpine AS base
WORKDIR /backend
RUN apk add --no-cache curl

FROM base AS builder
# Install pnpm
RUN curl -fsSL 'https://github.com/pnpm/pnpm/releases/download/v8.6.0/pnpm-linuxstatic-x64' -o /bin/pnpm \
    && chmod +x /bin/pnpm

COPY package.json pnpm-lock.yaml .
RUN pnpm i -P
RUN cp -R node_modules /tmp/node_modules
RUN pnpm install

COPY tsconfig.json tsconfig.build.json nest-cli.json .
COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate
RUN pnpm run build

# Use only required libraries and files to run the app
FROM base AS release
COPY --from=builder /tmp/node_modules ./node_modules
COPY --from=builder /backend/dist ./dist
COPY --from=builder /backend/prisma ./prisma
COPY --from=builder /backend/package.json ./
RUN npx prisma generate

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl 127.0.0.1:8000/api/healthcheck || exit 1

EXPOSE 8000

ENTRYPOINT ["npm", "run", "migrate:start:prod"]
