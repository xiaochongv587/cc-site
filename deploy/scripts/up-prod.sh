#!/usr/bin/env bash
###
 # @Description: 
 # @Author:  
 # @Date: 2026-07-13 19:47:00
 # @LastEditTime: 2026-07-14 00:52:16
 # @LastEditors:  
### 
# =============================================================================
# up-prod.sh — 生产服务器 Docker 部署的快捷入口
# =============================================================================
#
# 【这个文件是干什么的？】
#   在「生产服务器」上拉取 Docker Hub 镜像并启动容器。
#   与 up-local.sh 的区别：
#     - 读 deploy/.env.prod（生产密钥、域名、数据目录等）
#     - 默认使用 docker-compose.prod.yml（只 pull 镜像，不在服务器上 build）
#
# 【典型部署流程】
#   cd deploy
#   cp .env.example .env.prod
#   # 编辑 .env.prod：改密码、域名、MYSQL_DATA_DIR 等
#
#   ./scripts/up-prod.sh pull    # 从 Docker Hub 拉取最新镜像
#   ./scripts/up-prod.sh up -d   # 后台启动
#
# 【一体式部署】
#   在 .env.prod 里设置 DEPLOY_MODE=bundle，或：
#   DEPLOY_MODE=bundle ./scripts/up-prod.sh pull
#   DEPLOY_MODE=bundle ./scripts/up-prod.sh up -d
#
# 【其他常用命令】
#   ./scripts/up-prod.sh ps
#   ./scripts/up-prod.sh logs -f
#   ./scripts/up-prod.sh down
# =============================================================================
set -euo pipefail

# 获取当前脚本所在目录的绝对路径，确保后续引用是可靠的
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# exec：转交给 compose.sh，第一个参数 prod 表示使用 .env.prod
exec "${DIR}/compose.sh" prod "$@"
