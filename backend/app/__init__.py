"""Flask 应用工厂。"""
from __future__ import annotations

import logging
import os

from flask import Flask, jsonify, send_from_directory

from app.config import get_config
from app.extensions import cors, db, jwt, migrate

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(get_config())

    # 确保上传目录存在
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # 初始化扩展
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    _register_blueprints(app)
    _register_jwt_handlers(app)
    _register_error_handlers(app)

    # 静态访问上传文件
    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename: str):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    # 首次运行自动建表 + 种子数据
    with app.app_context():
        from app.seed import init_database

        init_database()

    return app


def _register_blueprints(app: Flask) -> None:
    from app.api.admin import admin_bp
    from app.api.auth import auth_bp
    from app.api.feed import feed_bp
    from app.api.public import public_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(public_bp, url_prefix="/api/public")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(feed_bp)  # /rss.xml、/sitemap.xml


def _register_jwt_handlers(app: Flask) -> None:
    @jwt.unauthorized_loader
    def _missing_token(reason):
        return jsonify({"message": "缺少认证令牌", "detail": reason}), 401

    @jwt.invalid_token_loader
    def _invalid_token(reason):
        return jsonify({"message": "无效的认证令牌", "detail": reason}), 401

    @jwt.expired_token_loader
    def _expired_token(header, payload):
        return jsonify({"message": "登录已过期，请重新登录"}), 401


def _register_error_handlers(app: Flask) -> None:
    @app.errorhandler(404)
    def _not_found(err):
        return jsonify({"message": "资源不存在"}), 404

    @app.errorhandler(413)
    def _too_large(err):
        return jsonify({"message": "上传文件过大（最大 8MB）"}), 413

    @app.errorhandler(500)
    def _server_error(err):
        logger.exception("服务器内部错误: %s", err)
        return jsonify({"message": "服务器内部错误"}), 500
