#!/usr/bin/env bash
# =============================================================================
# release.sh — 一键「构建 + 推送」到 Docker Hub
# =============================================================================
#
# 【这个文件是干什么的？】
#   把 build.sh 和 push.sh 串联起来，省去分两步执行的麻烦。
#   适合版本发布时使用。
#
# 【用法示例】
#   cd deploy
#   ./scripts/release.sh --split     # 分离式：构建并推送 backend + web
#   ./scripts/release.sh --bundle    # 一体式：构建并推送 app
#   ./scripts/release.sh             # 不传参数时会交互式让你选 1 或 2
#
#   # 生产发布（推荐：build 和 push 都用 .env.prod 里的版本号）
#   DEPLOY_ENV_FILE=.env.prod ./scripts/release.sh --split
#
# 【执行顺序】
#   1. 选择部署方式（只问一次，build 和 push 共用同一个 DEPLOY_MODE）
#   2. 调用 build.sh 构建镜像
#   3. 调用 push.sh 推送到 Docker Hub
#
# 【注意】
#   build.sh 默认读 .env.local，push.sh 默认读 .env.prod。
#   生产发布时建议加 DEPLOY_ENV_FILE=.env.prod，保证版本号一致。
# =============================================================================
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 引入部署方式选择逻辑
# shellcheck disable=SC1091
source "${DIR}/deploy-mode.sh"

# 只选择一次部署方式，export 后 build.sh / push.sh 里的 resolve_deploy_mode
# 会直接读到已设置的 DEPLOY_MODE，不会再次弹菜单
resolve_deploy_mode "$@"
export DEPLOY_MODE

# 依次执行构建和推送（任一步失败会因 set -e 而终止）
"${DIR}/build.sh"
"${DIR}/push.sh"
