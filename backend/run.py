"""开发入口：python run.py 启动 Flask（默认端口 7200）。"""
from __future__ import annotations

import os

from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "7200"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_ENV") != "production")
