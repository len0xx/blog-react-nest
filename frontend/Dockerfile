FROM node:20-alpine AS base
WORKDIR /frontend
RUN apk add --no-cache curl

FROM base AS builder

# Install pnpm
RUN curl -fsSL 'https://github.com/pnpm/pnpm/releases/download/v8.6.0/pnpm-linuxstatic-x64' -o /bin/pnpm \
    && chmod +x /bin/pnpm

COPY package.json .
RUN pnpm i -P
RUN cp -R node_modules /tmp/node_modules
RUN pnpm install

COPY next.config.js tsconfig.json config.ts util.ts middleware.ts .

# COPY public ./public
COPY lib ./lib
COPY types ./types
COPY app ./app
COPY components ./components

ENV NEXT_PUBLIC_API_HOST=blog.local
ENV NEXT_PUBLIC_PROTOCOL=http

RUN pnpm run build

FROM base AS release
COPY --from=builder /tmp/node_modules ./node_modules
COPY --from=builder /frontend/.next ./.next
COPY --from=builder /frontend/package.json ./

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start"]
