FROM cgr.dev/chainguard/node:latest-dev AS build
WORKDIR /
COPY --chown=node:node package*.json tsconfig*.json vite.config.ts ./
RUN npm ci
COPY --chown=node:node . .
RUN npm run build

FROM cgr.dev/chainguard/nginx:latest
COPY --from=build --chown=nonroot:nonroot /dist /usr/share/nginx/html
COPY --chown=nonroot:nonroot ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080