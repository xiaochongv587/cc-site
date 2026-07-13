"""项目模型。"""
from __future__ import annotations

import json
from datetime import datetime, timezone

from app.extensions import db


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500), default="")
    # 技术栈以 JSON 字符串存储
    tech_stack = db.Column(db.Text, default="[]")
    cover = db.Column(db.String(500), default="")
    github_url = db.Column(db.String(500), default="")
    demo_url = db.Column(db.String(500), default="")
    stars = db.Column(db.Integer, default=0)
    featured = db.Column(db.Boolean, default=False, index=True)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=_utcnow)

    @property
    def tech_list(self) -> list[str]:
        try:
            return json.loads(self.tech_stack or "[]")
        except (ValueError, TypeError):
            return []

    @tech_list.setter
    def tech_list(self, value: list[str]) -> None:
        self.tech_stack = json.dumps(value or [], ensure_ascii=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "techStack": self.tech_list,
            "cover": self.cover,
            "githubUrl": self.github_url,
            "demoUrl": self.demo_url,
            "stars": self.stars,
            "featured": self.featured,
            "sortOrder": self.sort_order,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
