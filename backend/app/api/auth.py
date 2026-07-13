"""认证相关接口。"""
from __future__ import annotations

import logging

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from app.models import User

logger = logging.getLogger(__name__)
auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"message": "用户名和密码不能为空"}), 400

    user = User.query.filter_by(username=username).first()
    if user is None or not user.check_password(password):
        logger.info("登录失败 username=%s", username)
        return jsonify({"message": "用户名或密码错误"}), 401

    token = create_access_token(identity=str(user.id))
    logger.info("登录成功 username=%s", username)
    return jsonify({"token": token, "user": user.to_dict()})


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if user is None:
        return jsonify({"message": "用户不存在"}), 404
    return jsonify(user.to_dict())
