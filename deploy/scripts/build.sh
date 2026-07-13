#!/usr/bin/env bash
# =============================================================================
# build.sh — 在本地构建 Docker 镜像（准备推送到镜像仓库）
# =============================================================================
#
# 【构建前准备】
#   1. 安装并启动 Docker
#   2. 配置 deploy/.env.local（或生产构建时用 DEPLOY_ENV_FILE=.env.prod）
#      其中 IMAGE_REGISTRY / IMAGE_NAMESPACE = 镜像仓库地址
#           IMAGE_TAG = 版本号，如 1.0.0
#
# 【用法示例】
#   cd deploy
#   ./scripts/build.sh --split
#   DEPLOY_ENV_FILE=.env.prod ./scripts/build.sh --split
#
# 【会构建哪些镜像？】
#   分离式：ccr.ccs.tencentyun.com/ccsite/cc-site-backend:TAG 和 cc-site-web:TAG
#   一体式：ccr.ccs.tencentyun.com/ccsite/cc-site-app:TAG
# =============================================================================
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "${DIR}/.." && pwd)"
ROOT_DIR="$(cd "${DEPLOY_DIR}/.." && pwd)"

# shellcheck disable=SC1091
source "${DIR}/deploy-mode.sh"
resolve_deploy_mode "$@"

cd "$ROOT_DIR"

ENV_FILE="${DEPLOY_ENV_FILE:-${DEPLOY_DIR}/.env.local}"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

VERSION="$(tr -d '[:space:]' < "${DEPLOY_DIR}/VERSION" 2>/dev/null || echo latest)"
IMAGE_PREFIX="$(image_repo_prefix)"
TAG="${IMAGE_TAG:-${VERSION}}"

if ! command -v docker >/dev/null 2>&1; then
  echo "错误：未找到 docker，请先安装 Docker 并确保已启动。" >&2
  exit 1
fi

echo "==> 构建镜像（仓库: ${IMAGE_PREFIX}）"
echo "    方式 : $(deploy_mode_label)"
echo "    ENV  : ${ENV_FILE}"
echo "    TAG  : ${TAG}"
echo ""

build_one() {
  local name="$1"
  local dockerfile="$2"
  echo ">>> ${name} : ${IMAGE_PREFIX}/${name}:${TAG}"
  docker build \
    -f "${dockerfile}" \
    -t "${IMAGE_PREFIX}/${name}:${TAG}" \
    -t "${IMAGE_PREFIX}/${name}:latest" \
    --build-arg "VERSION=${TAG}" \
    .
}

case "${DEPLOY_MODE}" in
  split)
    build_one "cc-site-backend" "deploy/images/backend/Dockerfile"
    build_one "cc-site-web" "deploy/images/web/Dockerfile"
    ;;
  bundle)
    build_one "cc-site-app" "deploy/images/app/Dockerfile"
    ;;
esac

echo ""
echo "==> 构建完成（$(deploy_mode_label)）"
docker images | grep "cc-site" | head -20 || true
echo ""
case "${DEPLOY_MODE}" in
  split)
    echo "本地验证：cd deploy && ./scripts/up-local.sh up -d --build"
    ;;
  bundle)
    echo "本地验证：cd deploy && DEPLOY_MODE=bundle ./scripts/up-local.sh up -d --build"
    ;;
esac
echo "推送镜像：cd deploy && DEPLOY_MODE=${DEPLOY_MODE} ./scripts/push.sh"
