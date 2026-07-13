"""Flask 扩展实例集中初始化，避免循环导入。"""
from __future__ import annotations

from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
cors = CORS()
