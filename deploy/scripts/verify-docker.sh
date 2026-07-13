#!/usr/bin/env bash
# =============================================================================
# verify-docker.sh — 检查 Jenkins / CI 环境能否执行 docker build & push
# =============================================================================
#
# 【用法】
#   ./scripts/verify-docker.sh
#
# 【检查项】
#   1. docker CLI 是否可用
#   2. 能否连接 Docker daemon（通常需挂载 /var/run/docker.sock）
#   3. docker compose 是否可用（生产部署需要）
# =============================================================================
set -euo pipefail

fail() {
  echo "错误：$1" >&2
  exit 1
}

if ! command -v docker >/dev/null 2>&1; then
  fail "未找到 docker CLI。请在 Jenkins 容器内安装 docker，并挂载 /var/run/docker.sock"
fi

echo "==> docker version"
docker version

if ! docker info >/dev/null 2>&1; then
  fail "无法连接 Docker daemon。请确认 Jenkins 容器已挂载 /var/run/docker.sock"
fi

echo ""
echo "==> docker info (summary)"
docker info --format 'Server Version: {{.ServerVersion}}' 2>/dev/null || docker info | head -5

if docker compose version >/dev/null 2>&1; then
  echo ""
  echo "==> docker compose version"
  docker compose version
elif command -v docker-compose >/dev/null 2>&1; then
  echo ""
  echo "==> docker-compose version"
  docker-compose version
else
  fail "未找到 docker compose，生产部署需要 docker compose 或 docker-compose"
fi

echo ""
echo "==> Docker 环境检查通过"
