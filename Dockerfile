FROM cgr.dev/chainguard/node:latest-dev AS build
WORKDIR /app
ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="/home/node/.local/share/pnpm:$PATH"
RUN corepack enable --install-directory /home/node/.local/share/pnpm && corepack prepare pnpm@latest --activate
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig*.json vite.config.ts ./
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . .
RUN pnpm run build

FROM cgr.dev/chainguard/nginx:latest
COPY --from=build --chown=nonroot:nonroot /app/dist /usr/share/nginx/html
COPY --chown=nonroot:nonroot ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080