FROM cgr.dev/chainguard/node:latest-dev AS build
WORKDIR /app
RUN --mount=type=secret,id=NODE_AUTH_TOKEN sh -c \
    'npm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN)'
RUN npm config set @navikt:registry=https://npm.pkg.github.com
COPY --chown=node:node package*.json tsconfig*.json vite.config.ts ./
RUN npm ci

COPY /. ./
RUN npm run build

FROM cgr.dev/chainguard/nginx:latest
COPY --from=build --chown=nonroot:nonroot /app/dist /usr/share/nginx/html
COPY --chown=nonroot:nonroot ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080