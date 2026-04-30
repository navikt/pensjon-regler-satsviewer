FROM cgr.dev/chainguard/node:latest-dev AS build
USER root
WORKDIR /app
ENV PNPM_HOME="/app/.pnpm"
ENV COREPACK_HOME="/app/.corepack"
ENV PATH="/app/.pnpm:$PATH"
RUN mkdir -p /app/.pnpm /app/.corepack && \
    corepack enable --install-directory /app/.pnpm && \
    corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig*.json vite.config.ts .npmrc ./
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    npm config set //npm.pkg.github.com/:_authToken "$(cat /run/secrets/NODE_AUTH_TOKEN)" && \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM cgr.dev/chainguard/nginx:latest-dev
USER root
# openssl+curl trengs av entrypoint.sh for JWT-signering og GitHub API-kall.
# chmod conf.d slik at nonroot-brukeren kan sed-e inn token ved oppstart.
RUN apk add --no-cache openssl curl && chmod 777 /etc/nginx/conf.d
USER nonroot
COPY --from=build --chown=nonroot:nonroot /app/dist /usr/share/nginx/html
COPY --chown=nonroot:nonroot ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 --chown=nonroot:nonroot ./config/entrypoint.sh /entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]