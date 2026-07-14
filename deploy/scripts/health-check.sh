#!/usr/bin/env bash
###
 # @Description: 
 # @Author:  
 # @Date: 2026-07-14 15:31:21
 # @LastEditTime: 2026-07-14 15:52:00
 # @LastEditors:  
### 
# =============================================================================
# health-check.sh — 部署后健康检查（在容器内探测，避免宿主机端口冲突）
# =============================================================================
#
# Jenkins 与 cc-site 同机时，WEB_PORT=8080 常与 Jenkins UI 冲突；
# curl 127.0.0.1:8080 会打到 Jenkins 并返回 403，而非应用。
# 本脚本通过 compose exec 在容器内访问 /api/health，与 compose 文件 healthcheck 一致。
#
# 用法（生产）：
#   cd deploy
#   DEPLOY_ENV_FILE=/path/.jenkins.env.prod ./scripts/health-check.sh
# =============================================================================
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAX_RETRIES="${HEALTH_CHECK_RETRIES:-10}"
SLEEP_SEC="${HEALTH_CHECK_SLEEP:-5}"

MODE="${DEPLOY_MODE:-split}"
case "$MODE" in
  split)
    SERVICE=backend
    HEALTH_URL='http://backend:7200/api/health'
    ;;
  bundle)
    SERVICE=app
    HEALTH_URL='http://127.0.0.1/api/health'
    ;;
  *)
    echo "无效 DEPLOY_MODE: $MODE（仅支持 split | bundle）" >&2
    exit 1
    ;;
esac

PY="import urllib.request; urllib.request.urlopen('${HEALTH_URL}')"

echo "==> Health check: ${SERVICE} (${HEALTH_URL}), mode=${MODE}"

for i in $(seq 1 "$MAX_RETRIES"); do
  if "${DIR}/compose.sh" prod exec -T "$SERVICE" python -c "$PY" >/dev/null 2>&1; then
    echo "Health check passed (${SERVICE})"
    exit 0
  fi
  echo "Waiting for ${SERVICE}... (${i}/${MAX_RETRIES})"
  sleep "$SLEEP_SEC"
done

echo "Health check failed after ${MAX_RETRIES} attempts" >&2
exit 1
