"""应用配置：集中读取环境变量，避免在业务代码中硬编码。"""
from __future__ import annotations

import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

# backend 根目录
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Config:
    """基础配置，所有环境共享。"""

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # 数据库：默认 SQLite，放在 backend 目录下
    _default_sqlite = f"sqlite:///{BASE_DIR / 'cc_site.db'}"
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", _default_sqlite)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    # 上传目录
    UPLOAD_FOLDER = str(BASE_DIR / os.getenv("UPLOAD_FOLDER", "uploads"))
    MAX_CONTENT_LENGTH = 8 * 1024 * 1024  # 单文件最大 8MB
    ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "svg"}

    # 默认管理员
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

    # 站点地址（RSS / sitemap）
    SITE_URL = os.getenv("SITE_URL", "http://localhost:5173")


def get_config() -> type[Config]:
    """返回配置类，预留多环境扩展点。"""
    return Config
