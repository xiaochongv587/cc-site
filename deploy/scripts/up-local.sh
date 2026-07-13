#!/usr/bin/env bash
# =============================================================================
# up-local.sh — 本地 Docker 部署的快捷入口
# =============================================================================
#
# 【这个文件是干什么的？】
#   在「你自己的 Mac / 开发机」上启动网站容器。
#   它会自动读取 deploy/.env.local，并使用本地 compose 配置。
#
# 【常用命令】
#   cd deploy
#   ./scripts/up-local.sh up -d --build    # 构建镜像并后台启动
#   ./scripts/up-local.sh ps               # 查看容器状态
#   ./scripts/up-local.sh logs -f backend  # 查看 backend 日志
#   ./scripts/up-local.sh down             # 停止并删除容器
#
# 【首次使用前】
#   cp .env.local.example .env.local
#   mkdir -p data/mysql data/uploads
#
# 【参数说明】
#   up -d --build  → up=启动，-d=后台运行，--build=有代码变更时重新构建镜像
#   你写在 up-local.sh 后面的参数，会原样传给 docker compose
# =============================================================================
set -euo pipefail

# 找到 scripts 目录的绝对路径
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# exec：转交给 compose.sh，第一个参数 local 表示使用 .env.local
# "$@"：把你传给 up-local.sh 的所有参数（如 up -d --build）继续传下去
exec "${DIR}/compose.sh" local "$@"
