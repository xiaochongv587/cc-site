#!/usr/bin/env bash
# =============================================================================
# push.sh — 把本地已构建的镜像推送到镜像仓库
# =============================================================================
#
# 【推送前必须做】
#   docker login ccr.ccs.tencentyun.com -u <腾讯云账号ID> --password-stdin
#   # 密码在 TCR 控制台「访问凭证」中获取
#
# 【用法示例】
#   cd deploy
#   ./scripts/push.sh --split
#   ./scripts/push.sh --bundle
# =============================================================================
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "${DIR}/.." && pwd)"

# shellcheck disable=SC1091
source "${DIR}/deploy-mode.sh"
resolve_deploy_mode "$@"

ENV_FILE="${DEPLOY_ENV_FILE:-${DEPLOY_DIR}/.env.prod}"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

VERSION="$(tr -d '[:space:]' < "${DEPLOY_DIR}/VERSION" 2>/dev/null || echo latest)"
IMAGE_PREFIX="$(image_repo_prefix)"
TAG="${IMAGE_TAG:-${VERSION}}"
REGISTRY="${IMAGE_REGISTRY:-ccr.ccs.tencentyun.com}"

if ! command -v docker >/dev/null 2>&1; then
  echo "错误：未找到 docker，请先安装 Docker。" >&2
  exit 1
fi

echo "==> 推送到 ${REGISTRY} (${IMAGE_PREFIX}, tag: ${TAG}, $(deploy_mode_label), env: ${ENV_FILE})"

while IFS= read -r img; do
  if docker image inspect "$img" >/dev/null 2>&1; then
    echo ">>> push $img"
    docker push "$img"
  else
    echo ">>> 跳过（本地不存在，请先运行 build.sh）: $img"
  fi
done < <(deploy_mode_images "$IMAGE_PREFIX" "$TAG")

echo ""
echo "==> 推送完成（$(deploy_mode_label)）"
case "${DEPLOY_MODE}" in
  split)
    echo "生产部署：cd deploy && DEPLOY_MODE=split ./scripts/up-prod.sh pull && ./scripts/up-prod.sh up -d"
    ;;
  bundle)
    echo "生产部署：cd deploy && DEPLOY_MODE=bundle ./scripts/up-prod.sh pull && ./scripts/up-prod.sh up -d"
    ;;
esac
