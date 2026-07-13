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

# 计算 deploy 目录的绝对路径（无论从哪执行脚本都能找到正确目录）
# BASH_SOURCE[0] = 当前脚本文件路径；dirname 取目录；cd + pwd 得到绝对路径
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DEPLOY_DIR"  # 切换到 deploy 目录，后续 docker compose 在此目录执行

# 第一个参数必须是 local（本地）或 prod（生产）
# ${1:?错误提示} 表示：没传参数就打印提示并退出
PROFILE="${1:?用法: compose.sh <local|prod> [docker compose 参数...]}"
shift  # shift：去掉第一个参数，剩下参数原样传给 docker compose（如 up -d / ps / down）

# 根据 local / prod 决定读哪个 env 文件
case "$PROFILE" in
  local) ENV_FILE=".env.local" ;;  # 本地开发配置
  prod)  ENV_FILE=".env.prod" ;;   # 生产服务器配置
  *)
    echo "未知环境: $PROFILE（仅支持 local / prod）" >&2
    exit 1
    ;;
esac

# env 文件必须存在，否则无法启动（里面有机密、端口、数据库密码等）
if [ ! -f "$ENV_FILE" ]; then
  echo "错误：未找到 $ENV_FILE，请先执行: cp .env.example $ENV_FILE" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# 确定 DEPLOY_MODE（分离式 split / 一体式 bundle）
# 优先级：① 命令行或 shell 里已 export 的 DEPLOY_MODE
#         ② .env 文件里的 DEPLOY_MODE=...
#         ③ 默认 split
# ---------------------------------------------------------------------------
if [ -z "${DEPLOY_MODE:-}" ] && [ -f "$ENV_FILE" ]; then
  # 从 env 文件中 grep 出 DEPLOY_MODE 那一行，取等号后面的值
  DEPLOY_MODE="$(grep -E '^DEPLOY_MODE=' "$ENV_FILE" | tail -1 | cut -d= -f2- | tr -d '[:space:]' || true)"
fi
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

# exec：用 docker compose 进程「替换」当前 shell 进程（脚本在此结束，不会继续往下跑）
# --env-file：把 .env.local / .env.prod 里的变量注入 compose
# $@ 剩余参数 ps 或 logs --tail=100，由 Docker Compose 内置子命令处理
if [ "$has_compose_file" = true ]; then
  exec docker compose --env-file "$ENV_FILE" "$@"
else
  exec docker compose --env-file "$ENV_FILE" "${DEFAULT_COMPOSE[@]}" "$@"
fi
