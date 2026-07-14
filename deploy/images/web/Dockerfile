# ---------- 前端构建 ----------
FROM node:22-alpine AS build

ARG VERSION=dev
LABEL org.opencontainers.image.title="cc-site-web-build" \
      org.opencontainers.image.version="${VERSION}"

WORKDIR /app
COPY frontend/package*.json ./
RUN npm config set registry https://registry.npmmirror.com \
    && npm ci
COPY frontend/ ./
RUN npm run build

# ---------- Nginx 运行 ----------
FROM nginx:1.27-alpine

ARG VERSION=dev
LABEL org.opencontainers.image.title="cc-site-web" \
      org.opencontainers.image.description="Nginx static + API proxy for cc-site" \
      org.opencontainers.image.version="${VERSION}"

COPY deploy/nginx/web.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
