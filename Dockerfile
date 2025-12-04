FROM cgr.dev/chainguard/node:latest-dev AS build
WORKDIR /app
COPY --chown=node:node package*.json tsconfig*.json vite.config.ts ./
RUN npm ci

COPY /. ./
RUN npm run build

FROM cgr.dev/chainguard/nginx:latest
COPY --from=build --chown=nonroot:nonroot /app/dist /usr/share/nginx/html
COPY --chown=nonroot:nonroot ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080