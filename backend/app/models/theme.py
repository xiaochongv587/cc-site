"""主题配置模型（单行配置）。"""
from __future__ import annotations

from app.extensions import db


class Theme(db.Model):
    __tablename__ = "theme"

    id = db.Column(db.Integer, primary_key=True)
    primary = db.Column(db.String(20), default="#3B82F6")
    secondary = db.Column(db.String(20), default="#6366F1")
    accent = db.Column(db.String(20), default="#F59E0B")
    preset = db.Column(db.String(50), default="极简白")
    bg_style = db.Column(db.String(50), default="渐变背景")
    radius = db.Column(db.String(50), default="小圆角 (8px)")

    def to_dict(self) -> dict:
        return {
            "primary": self.primary,
            "secondary": self.secondary,
            "accent": self.accent,
            "preset": self.preset,
            "bgStyle": self.bg_style,
            "radius": self.radius,
        }
