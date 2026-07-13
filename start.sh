#!/usr/bin/env bash
# 一键启动开发环境：后端 Flask（:7200）+ 前端 Vite（:5173）
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "==> 检查运行环境"

# ---- Python 3.12+ ----
PY_BIN=""
for cand in python3.14 python3.13 python3.12 python3; do
  if command -v "$cand" >/dev/null 2>&1; then
    ver=$("$cand" -c 'import sys;print(f"{sys.version_info.major}.{sys.version_info.minor}")')
    major=${ver%.*}; minor=${ver#*.}
    if [ "$major" -eq 3 ] && [ "$minor" -ge 12 ]; then PY_BIN="$cand"; break; fi
  fi
done
if [ -z "$PY_BIN" ]; then
  echo "错误：未找到 Python 3.12+，请先安装。" >&2
  exit 1
fi
echo "使用 Python: $($PY_BIN --version)"

# ---- Node 22+（尝试通过 nvm 切换） ----
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh"
  nvm use 22 >/dev/null 2>&1 || nvm use 22.22.3 >/dev/null 2>&1 || true
fi
if ! command -v node >/dev/null 2>&1; then
  echo "错误：未找到 Node，请安装 Node 22+。" >&2
  exit 1
fi
echo "使用 Node: $(node --version)"

# ---- 后端 ----
echo "==> 准备后端"
cd "$ROOT_DIR/backend"
if [ ! -d venv ]; then
  "$PY_BIN" -m venv venv
fi
./venv/bin/pip install -q --upgrade pip
./venv/bin/pip install -q -r requirements.txt
[ -f .env ] || cp .env.example .env
mkdir -p uploads

echo "==> 启动后端 (http://localhost:7200)"
./venv/bin/python run.py &
BACKEND_PID=$!

# ---- 前端 ----
echo "==> 准备前端"
cd "$ROOT_DIR/frontend"
if [ ! -d node_modules ]; then
  npm install
fi

echo "==> 启动前端 (http://localhost:5173)"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "======================================"
echo " 前端: http://localhost:5173"
echo " 后端: http://localhost:7200/api/health"
echo " 后台: http://localhost:5173/admin/login (admin / admin123)"
echo "======================================"
echo "按 Ctrl+C 停止全部服务"

trap 'echo "正在停止..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT TERM
wait
