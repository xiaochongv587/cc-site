"""技能模型。"""
from __future__ import annotations

from app.extensions import db


class Skill(db.Model):
    __tablename__ = "skills"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(64), default="前端", index=True)
    level = db.Column(db.Integer, default=80)  # 熟练度 0-100
    sort_order = db.Column(db.Integer, default=0)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "level": self.level,
            "sortOrder": self.sort_order,
        }
