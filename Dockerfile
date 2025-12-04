FROM cgr.dev/chainguard/node:latest-dev AS build
WORKDIR /app
COPY --chown=node:node package*.json tsconfig*.json vite.config.ts ./
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    npm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN)
RUN npm config set @navikt:registry=https://npm.pkg.github.com
RUN npm install --no-audit --ignore-scripts
RUN npm ci
COPY --chown=node:node . .
RUN npm run build

FROM cgr.dev/chainguard/nginx:latest
COPY --from=build --chown=nonroot:nonroot /app/dist /usr/share/nginx/html
COPY --chown=nonroot:nonroot ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080