#!/usr/bin/env bash
# =============================================================================
# build.sh — 在本地构建 Docker 镜像（准备推送到 Docker Hub）
# =============================================================================
#
# 【这个文件是干什么的？】
#   根据 Dockerfile 把项目代码「打包」成 Docker 镜像，类似给应用拍快照。
#   构建完成后，镜像只存在你的电脑上，还没上传到 Docker Hub。
#
# 【构建前准备】
#   1. 安装并启动 Docker Desktop
#   2. 配置 deploy/.env.local（或生产构建时用 DEPLOY_ENV_FILE=.env.prod）
#      其中 DOCKERHUB_USER = 你的 Docker Hub 用户名
#           IMAGE_TAG     = 版本号，如 1.0.0
#
# 【用法示例】
#   cd deploy
#   ./scripts/build.sh              # 运行后会提示选 1（分离式）或 2（一体式）
#   ./scripts/build.sh --split      # 只构建 backend + web
#   ./scripts/build.sh --bundle     # 只构建 app 一体式镜像
#
#   # 生产发布时，建议指定 .env.prod（里面有正式版本号）
#   DEPLOY_ENV_FILE=.env.prod ./scripts/build.sh --split
#
# 【会构建哪些镜像？】
#   分离式（--split）：
#     xiaochongv587/cc-site-backend:1.0.0  和 :latest
#     xiaochongv587/cc-site-web:1.0.0      和 :latest
#   一体式（--bundle）：
#     xiaochongv587/cc-site-app:1.0.0      和 :latest
#
# 【构建完成后】
#   用 ./scripts/push.sh 推送到 Docker Hub
#   或 ./scripts/release.sh 一键构建+推送
# =============================================================================
set -euo pipefail

# ---------- 路径计算 ----------
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"       # deploy/scripts/
DEPLOY_DIR="$(cd "${DIR}/.." && pwd)"                       # deploy/
ROOT_DIR="$(cd "${DEPLOY_DIR}/.." && pwd)"                  # 项目根目录 cc-site/

# 引入 deploy-mode.sh，获得「选择分离式/一体式」的能力
# shellcheck disable=SC1091
source "${DIR}/deploy-mode.sh"
resolve_deploy_mode "$@"  # 解析 --split / --bundle 或弹出交互菜单

# docker build 需要在项目根目录执行（因为 Dockerfile 里 COPY backend/ frontend/）
cd "$ROOT_DIR"

# ---------- 读取环境变量 ----------
# 默认读 .env.local；生产构建可设 DEPLOY_ENV_FILE=.env.prod
ENV_FILE="${DEPLOY_ENV_FILE:-${DEPLOY_DIR}/.env.local}"
if [ -f "$ENV_FILE" ]; then
  set -a          # set -a：之后 source 的变量自动 export 到子进程
  # shellcheck disable=SC1090
  source "$ENV_FILE"   # 相当于「执行」env 文件，把里面的 KEY=VALUE 载入当前 shell
  set +a          # 关闭自动 export
fi

# 版本号：优先用 env 里的 IMAGE_TAG，否则读 deploy/VERSION 文件，再否则用 latest
VERSION="$(tr -d '[:space:]' < "${DEPLOY_DIR}/VERSION" 2>/dev/null || echo latest)"
USER="${DOCKERHUB_USER:-xiaochongv587}"   # Docker Hub 用户名，${变量:-默认值} 表示变量为空时用默认值
TAG="${IMAGE_TAG:-${VERSION}}"

# 检查 docker 命令是否可用
if ! command -v docker >/dev/null 2>&1; then
  echo "错误：未找到 docker，请先安装 Docker Desktop 并确保已启动。" >&2
  exit 1
fi

echo "==> 构建镜像（Docker Hub: ${USER}）"
echo "    方式 : $(deploy_mode_label)"
echo "    ENV  : ${ENV_FILE}"
echo "    TAG  : ${TAG}"
echo ""

# ---------- 内部函数：构建单个镜像 ----------
# 参数 $1 = 镜像名（如 cc-site-backend）
# 参数 $2 = Dockerfile 相对项目根的路径
build_one() {
  local name="$1"
  local dockerfile="$2"
  echo ">>> ${name} : ${USER}/${name}:${TAG}"
  docker build \
    -f "${dockerfile}" \                    # 指定 Dockerfile 路径
    -t "${USER}/${name}:${TAG}" \           # 打标签：用户名/镜像名:版本号
    -t "${USER}/${name}:latest" \           # 同时打 latest 标签（方便拉取最新版）
    --build-arg "VERSION=${TAG}" \          # 传入构建参数，Dockerfile 里 ARG VERSION 可接收
    .                                       # 构建上下文 = 当前目录（项目根）
}

# ---------- 按部署方式构建 ----------
case "${DEPLOY_MODE}" in
  split)
    build_one "cc-site-backend" "deploy/images/backend/Dockerfile"
    build_one "cc-site-web" "deploy/images/web/Dockerfile"
    ;;
  bundle)
    build_one "cc-site-app" "deploy/images/app/Dockerfile"
    ;;
esac

# ---------- 构建完成，打印提示 ----------
echo ""
echo "==> 构建完成（$(deploy_mode_label)）"
docker images | grep "${USER}/cc-site" | head -20 || true   # 列出刚构建的镜像
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
