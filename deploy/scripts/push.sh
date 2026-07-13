#!/usr/bin/env bash
# =============================================================================
# push.sh — 把本地已构建的镜像推送到 Docker Hub
# =============================================================================
#
# 【这个文件是干什么的？】
#   把 build.sh 构建好的镜像「上传」到 Docker Hub 云端仓库。
#   生产服务器之后可以通过 docker pull 拉取这些镜像。
#
# 【推送前必须做】
#   docker login
#   # 输入 Docker Hub 用户名
#   # 密码处填 Access Token（在 hub.docker.com → Account Settings → Security 创建）
#   # 注意：不是 Docker Hub 登录密码，而是 Token！
#
# 【用法示例】
#   cd deploy
#   ./scripts/push.sh --split      # 推送 backend + web
#   ./scripts/push.sh --bundle     # 推送 app
#
#   # 默认读取 deploy/.env.prod 里的 DOCKERHUB_USER 和 IMAGE_TAG
#
# 【推送逻辑】
#   只会推送「本地已经存在」的镜像；不存在的会跳过并提示。
#   分离式推送 4 个 tag，一体式推送 2 个 tag（版本号 + latest 各一份）。
#
# 【推送完成后】
#   在生产服务器执行：
#     ./scripts/up-prod.sh pull && ./scripts/up-prod.sh up -d
# =============================================================================
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "${DIR}/.." && pwd)"

# 引入并解析部署方式（分离式 / 一体式）
# shellcheck disable=SC1091
source "${DIR}/deploy-mode.sh"
resolve_deploy_mode "$@"

# 推送默认读 .env.prod（生产配置）；也可用 DEPLOY_ENV_FILE 指定其他文件
ENV_FILE="${DEPLOY_ENV_FILE:-${DEPLOY_DIR}/.env.prod}"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

VERSION="$(tr -d '[:space:]' < "${DEPLOY_DIR}/VERSION" 2>/dev/null || echo latest)"
USER="${DOCKERHUB_USER:-xiaochongv587}"
TAG="${IMAGE_TAG:-${VERSION}}"

if ! command -v docker >/dev/null 2>&1; then
  echo "错误：未找到 docker，请先安装 Docker Desktop。" >&2
  exit 1
fi

echo "==> 推送到 Docker Hub (${USER}, tag: ${TAG}, $(deploy_mode_label), env: ${ENV_FILE})"

# deploy_mode_images 会输出要推送的镜像名列表（每行一个）
# while read：逐行读取；< <(...) 是进程替换，把函数输出当作输入
while IFS= read -r img; do
  # docker image inspect：检查本地是否有这个镜像
  if docker image inspect "$img" >/dev/null 2>&1; then
    echo ">>> push $img"
    docker push "$img"    # 实际上传到 Docker Hub
  else
    echo ">>> 跳过（本地不存在，请先运行 build.sh）: $img"
  fi
done < <(deploy_mode_images "$USER" "$TAG")

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
