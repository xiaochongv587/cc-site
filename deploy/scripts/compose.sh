#!/usr/bin/env bash
# =============================================================================
# compose.sh — Docker Compose 的统一入口（核心脚本）
# =============================================================================
#
# 【这个文件是干什么的？】
#   封装 `docker compose` 命令，帮你自动完成两件事：
#     1. 加载正确的环境变量文件（.env.local 或 .env.prod）
#     2. 根据 DEPLOY_MODE 选择正确的 compose 配置文件
#
# 【你一般不需要直接运行它】
#   日常请用更简单的包装脚本：
#     ./scripts/up-local.sh up -d --build    # 本地
#     ./scripts/up-prod.sh pull && ./scripts/up-prod.sh up -d   # 生产
#
# 【直接用法示例】
#   ./scripts/compose.sh local  up -d --build
#   ./scripts/compose.sh prod   pull
#   ./scripts/compose.sh prod   up -d
#
# 【compose 文件对照表】
#   本地 + 分离式  → docker-compose.yml
#   本地 + 一体式  → docker-compose.bundle.yml
#   生产 + 分离式  → docker-compose.prod.yml
#   生产 + 一体式  → docker-compose.prod.bundle.yml
# =============================================================================
set -euo pipefail

# 解析可用的 compose 命令：优先 docker compose 插件，否则回退 docker-compose（Jenkins 常见）
resolve_compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD=(docker compose)
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD=(docker-compose)
  else
    echo "错误：未找到 docker compose 或 docker-compose" >&2
    exit 1
  fi
}

# 计算 deploy 目录的绝对路径（无论从哪执行脚本都能找到正确目录）
# BASH_SOURCE[0] = 当前脚本文件路径；dirname 取目录；cd + pwd 得到绝对路径
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DEPLOY_DIR"  # 切换到 deploy 目录，后续 docker compose 在此目录执行

# 第一个参数必须是 local（本地）或 prod（生产）
# ${1:?错误提示} 表示：没传参数就打印提示并退出
PROFILE="${1:?用法: compose.sh <local|prod> [docker compose 参数...]}"
shift  # shift：去掉第一个参数，剩下参数原样传给 docker compose（如 up -d / ps / down）

# 根据 local / prod 决定读哪个 env 文件（Jenkins 可通过 DEPLOY_ENV_FILE 注入 Secret file 路径）
case "$PROFILE" in
  local) ENV_FILE="${DEPLOY_ENV_FILE:-.env.local}" ;;  # 本地开发配置
  prod)  ENV_FILE="${DEPLOY_ENV_FILE:-.env.prod}" ;;   # 生产服务器配置
  *)
    echo "未知环境: $PROFILE（仅支持 local / prod）" >&2
    exit 1
    ;;
esac

# 相对路径基于 deploy 目录；绝对路径（如 Jenkins WORKSPACE/.jenkins.env.prod）保持不变
if [[ "$ENV_FILE" != /* ]]; then
  ENV_FILE="${DEPLOY_DIR}/${ENV_FILE#./}"
fi

# env 文件必须存在，否则无法启动（里面有机密、端口、数据库密码等）
if [ ! -f "$ENV_FILE" ]; then
  echo "错误：未找到 $ENV_FILE，请先执行: cp .env.example $ENV_FILE" >&2
  exit 1
fi

# 加载 env 到当前 shell（兼容 Jenkins 仅安装 docker-compose、不支持 --env-file 的场景）
_PRESERVE_DEPLOY_MODE="${DEPLOY_MODE:-}"
_PRESERVE_IMAGE_TAG="${IMAGE_TAG:-}"

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

[ -n "$_PRESERVE_DEPLOY_MODE" ] && export DEPLOY_MODE="$_PRESERVE_DEPLOY_MODE"
[ -n "$_PRESERVE_IMAGE_TAG" ] && export IMAGE_TAG="$_PRESERVE_IMAGE_TAG"

# ---------------------------------------------------------------------------
# 确定 DEPLOY_MODE（分离式 split / 一体式 bundle）
# 优先级：① 命令行或 shell 里已 export 的 DEPLOY_MODE
#         ② .env 文件里的 DEPLOY_MODE=...
#         ③ 默认 split
# ---------------------------------------------------------------------------
DEPLOY_MODE="${DEPLOY_MODE:-split}"

# 根据「环境 + 部署方式」选出默认的 compose 文件
case "$DEPLOY_MODE" in
  split)
    case "$PROFILE" in
      local) DEFAULT_COMPOSE=(-f docker-compose.yml) ;;
      prod)  DEFAULT_COMPOSE=(-f docker-compose.prod.yml) ;;
    esac
    ;;
  bundle)
    case "$PROFILE" in
      local) DEFAULT_COMPOSE=(-f docker-compose.bundle.yml) ;;
      prod)  DEFAULT_COMPOSE=(-f docker-compose.prod.bundle.yml) ;;
    esac
    ;;
  *)
    echo "无效 DEPLOY_MODE: $DEPLOY_MODE（仅支持 split | bundle）" >&2
    exit 1
    ;;
esac

# ---------------------------------------------------------------------------
# 如果你自己在命令里写了 -f xxx.yml，就尊重你的选择，不再用默认 compose 文件
# 例如：./scripts/up-local.sh -f docker-compose.bundle.yml up -d --build
# ---------------------------------------------------------------------------
has_compose_file=false
for arg in "$@"; do
  if [ "$arg" = "-f" ] || [[ "$arg" == *.yml ]]; then
    has_compose_file=true
    break
  fi
done

resolve_compose_cmd

# exec：用 compose 进程「替换」当前 shell 进程（脚本在此结束，不会继续往下跑）
if [ "$has_compose_file" = true ]; then
  exec "${COMPOSE_CMD[@]}" "$@"
else
  exec "${COMPOSE_CMD[@]}" "${DEFAULT_COMPOSE[@]}" "$@"
fi
