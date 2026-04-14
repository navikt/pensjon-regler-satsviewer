FROM cgr.dev/chainguard/node:latest-dev AS build
WORKDIR /app
ENV PNPM_HOME="/app/.pnpm"
ENV COREPACK_HOME="/app/.corepack"
ENV PATH="/app/.pnpm:$PATH"
RUN mkdir -p /app/.pnpm /app/.corepack && \
    corepack enable --install-directory /app/.pnpm && \
    corepack prepare pnpm@latest --activate
ARG NODE_AUTH_TOKEN
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig*.json vite.config.ts .npmrc ./
RUN echo "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}" >> .npmrc && \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM cgr.dev/chainguard/nginx:latest
COPY --from=build --chown=nonroot:nonroot /app/dist /usr/share/nginx/html
COPY --chown=nonroot:nonroot ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080