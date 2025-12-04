# build frontend and server
FROM node:lts-alpine3.21 as build
WORKDIR /.
COPY package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts ./
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    npm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN)
RUN npm config set @navikt:registry=https://npm.pkg.github.com
RUN npm install --no-audit --ignore-scripts

RUN npm ci

COPY /. ./
RUN npm run build

# production environment
FROM nginxinc/nginx-unprivileged:stable-alpine
COPY --from=build /dist /usr/share/nginx/html
COPY ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]