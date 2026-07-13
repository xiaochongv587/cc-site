# 一体式镜像：Nginx（静态 + 反代）+ Gunicorn（Flask API）

FROM node:22-alpine AS frontend-build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim

ARG VERSION=dev
LABEL org.opencontainers.image.title="cc-site-app" \
      org.opencontainers.image.description="Personal website (React + Flask bundle)" \
      org.opencontainers.image.version="${VERSION}"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /app/uploads /var/log/nginx /run/nginx

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY deploy/nginx/bundle.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/conf.d/default.conf \
    && ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

COPY deploy/scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1/api/health')" || exit 1

ENTRYPOINT ["/entrypoint.sh"]
