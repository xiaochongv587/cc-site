#!/usr/bin/env bash
# =============================================================================
# deploy-mode.sh — 选择「分离式」还是「一体式」部署
# =============================================================================
#
# 【这个文件是干什么的？】
#   本项目有两种 Docker 部署方式：
#     - split（分离式）：backend 和 web 各一个容器，适合正式生产环境
#     - bundle（一体式）：前后端打包进一个 app 容器，适合简单部署
#
#   本文件不单独运行，会被 build.sh / push.sh / release.sh 引用（source）。
#   它负责帮你在「构建镜像」和「推送镜像」时确定要处理哪些镜像。
#
# 【如何指定部署方式？（优先级从高到低）】
#   1. 命令行参数：  ./scripts/build.sh --split   或  --bundle
#   2. 环境变量：    DEPLOY_MODE=split ./scripts/build.sh
#   3. 交互式选择：  直接运行脚本，终端会提示输入 1 或 2
#
# 【脚本安全设置】
#   set -euo pipefail 含义：
#     -e  任意命令失败（返回非 0）就立刻退出，避免错误继续执行
#     -u  使用了未定义的变量就报错退出
#     pipefail  管道中任一命令失败，整个管道视为失败
# =============================================================================
set -euo pipefail

# -----------------------------------------------------------------------------
# 函数：resolve_deploy_mode
# 作用：解析并确定 DEPLOY_MODE 的值（split 或 bundle）
# 参数："$@" 表示传给脚本的全部命令行参数
# -----------------------------------------------------------------------------
resolve_deploy_mode() {
  local arg  # local：函数内部的局部变量，不影响外部

  # 第一步：检查命令行里有没有 --split / --bundle 等参数
  for arg in "$@"; do
    case "$arg" in
      --split|-s|split)
        DEPLOY_MODE=split
        return 0  # 已确定，直接返回
        ;;
      --bundle|-b|bundle)
        DEPLOY_MODE=bundle
        return 0
        ;;
      --mode)
        # --mode 后面必须跟值，例如 --mode split；单独写 --mode 是错误用法
        echo "错误：--mode 需要值，请使用 --mode split 或 --mode bundle" >&2
        exit 1
        ;;
      --mode=*)
        # 支持 --mode=split 这种写法，${arg#--mode=} 表示去掉前缀后取等号右边的值
        DEPLOY_MODE="${arg#--mode=}"
        _validate_deploy_mode
        return 0
        ;;
    esac
  done

  # 第二步：如果命令行没指定，看环境变量 DEPLOY_MODE 是否已经设置
  if [ -n "${DEPLOY_MODE:-}" ]; then
    _validate_deploy_mode
    return 0
  fi

  # 第三步：非交互环境（如 CI 流水线）不能弹菜单，必须提前指定方式
  # [ ! -t 0 ] 表示：当前不是「可输入的终端」
  if [ ! -t 0 ]; then
    echo "错误：未指定部署方式。请设置 DEPLOY_MODE=split|bundle 或使用 --split / --bundle。" >&2
    exit 1
  fi

  # 第四步：交互式菜单，让用户手动选择
  echo ""
  echo "请选择部署方式："
  echo "  1) 分离式 — backend + web 两个镜像（docker-compose.yml / docker-compose.prod.yml）"
  echo "  2) 一体式 — app 单个镜像（docker-compose.bundle.yml）"
  echo ""
  local choice
  read -r -p "输入 1 或 2 [默认 1]: " choice
  case "${choice:-1}" in  # ${choice:-1} 表示：用户直接回车则用默认值 1
    1|split|分离|分离式) DEPLOY_MODE=split ;;
    2|bundle|一体|一体式) DEPLOY_MODE=bundle ;;
    *)
      echo "无效选择: ${choice}" >&2
      exit 1
      ;;
  esac

  _validate_deploy_mode
}

# -----------------------------------------------------------------------------
# 函数：_validate_deploy_mode（内部函数，名前下划线表示「仅供本文件使用」）
# 作用：检查 DEPLOY_MODE 只能是 split 或 bundle，然后 export 给子脚本使用
# -----------------------------------------------------------------------------
_validate_deploy_mode() {
  case "${DEPLOY_MODE}" in
    split|bundle) export DEPLOY_MODE ;;  # export：让后续调用的脚本也能读到这个变量
    *)
      echo "无效 DEPLOY_MODE: ${DEPLOY_MODE}（仅支持 split | bundle）" >&2
      exit 1
      ;;
  esac
}

# -----------------------------------------------------------------------------
# 函数：deploy_mode_label
# 作用：把 split/bundle 转成中文说明，用于打印日志
# -----------------------------------------------------------------------------
deploy_mode_label() {
  case "${DEPLOY_MODE}" in
    split) echo "分离式 (backend + web)" ;;
    bundle) echo "一体式 (app)" ;;
  esac
}

# -----------------------------------------------------------------------------
# 函数：image_repo_prefix
# 作用：返回镜像仓库前缀（registry/namespace）
# 输出：例如 ccr.ccs.tencentyun.com/ccsite
# -----------------------------------------------------------------------------
image_repo_prefix() {
  local registry namespace
  registry="${IMAGE_REGISTRY:-ccr.ccs.tencentyun.com}"
  namespace="${IMAGE_NAMESPACE:-ccsite}"
  echo "${registry}/${namespace}"
}

# -----------------------------------------------------------------------------
# 函数：deploy_mode_images
# 作用：根据部署方式，列出需要构建/推送的 Docker 镜像完整名称
# 参数：$1 = 镜像仓库前缀（registry/namespace），$2 = 镜像标签（版本号）
# 输出：每行一个镜像名，例如 ccr.ccs.tencentyun.com/ccsite/cc-site-backend:1.0.0
# -----------------------------------------------------------------------------
deploy_mode_images() {
  local prefix="$1"
  local tag="$2"
  case "${DEPLOY_MODE}" in
    split)
      # 分离式要处理 4 个 tag：backend 和 web 各两个（版本号 + latest）
      echo "${prefix}/cc-site-backend:${tag}"
      echo "${prefix}/cc-site-backend:latest"
      echo "${prefix}/cc-site-web:${tag}"
      echo "${prefix}/cc-site-web:latest"
      ;;
    bundle)
      # 一体式只处理 app 镜像
      echo "${prefix}/cc-site-app:${tag}"
      echo "${prefix}/cc-site-app:latest"
      ;;
  esac
}
