#!/bin/sh
# =============================================================================
# entrypoint.sh — 一体式（bundle）镜像的容器启动脚本
# =============================================================================
#
# 【这个文件是干什么的？】
#   仅用于「一体式 app 镜像」（cc-site-app）。
#   容器启动时需要同时跑两个进程：
#     - gunicorn：Python 后端 API（监听 127.0.0.1:7200，仅容器内部访问）
#     - nginx：    对外提供网站（监听 80 端口，用户浏览器访问这个）
#
#   nginx 会把 /api 请求转发给 gunicorn，静态页面由 nginx 直接返回。
#
# 【为什么用 #!/bin/sh 而不是 bash？】
#   一体式镜像基于 alpine，体积更小；sh 是 POSIX 标准 shell，兼容性更好。
#
# 【进程关系】
#   gunicorn 在后台运行（&），nginx 在前台运行（exec）。
#   Docker 要求容器有一个「前台主进程」，主进程退出容器就停止。
#   所以 nginx 用 exec 替换当前 shell，成为主进程。
#
# 【优雅退出】
#   trap 捕获 SIGINT/SIGTERM（docker stop 会发这些信号），
#   先停 gunicorn，再让 nginx 正常退出。
# =============================================================================
set -e  # 任意命令失败立即退出

# 确保上传目录存在（用户上传的图片等存这里）
mkdir -p /app/uploads

# 后台启动 Flask 后端（gunicorn 是 Python 的 WSGI 服务器，比开发用的 flask run 更适合生产）
echo "[entrypoint] starting gunicorn..."
gunicorn -w 2 -b 127.0.0.1:7200 --timeout 60 wsgi:app &
GUNICORN_PID=$!   # $! = 上一个后台进程的 PID（进程 ID）

# 定义清理函数：容器停止时调用
cleanup() {
  echo "[entrypoint] shutting down..."
  kill "$GUNICORN_PID" 2>/dev/null || true   # 通知 gunicorn 退出；|| true 避免 kill 失败导致脚本中断
  wait "$GUNICORN_PID" 2>/dev/null || true   # 等待 gunicorn 完全退出
}
trap cleanup INT TERM   # 收到中断/终止信号时执行 cleanup

# 前台启动 nginx（用户访问的 80 端口由 nginx 监听）
echo "[entrypoint] starting nginx..."
exec nginx -g 'daemon off;'   # daemon off = nginx 不后台化，保持在前台运行
