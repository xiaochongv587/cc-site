"""文章模型。"""
from __future__ import annotations

import json
from datetime import datetime, timezone

from app.extensions import db


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Article(db.Model):
    __tablename__ = "articles"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    summary = db.Column(db.String(500), default="")
    content = db.Column(db.Text, default="")
    category = db.Column(db.String(64), default="技术", index=True)
    # 标签以 JSON 字符串存储，读写时转换为 list
    tags = db.Column(db.Text, default="[]")
    cover = db.Column(db.String(500), default="")
    views = db.Column(db.Integer, default=0)
    published = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, default=_utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow)

    @property
    def tag_list(self) -> list[str]:
        try:
            return json.loads(self.tags or "[]")
        except (ValueError, TypeError):
            return []

    @tag_list.setter
    def tag_list(self, value: list[str]) -> None:
        self.tags = json.dumps(value or [], ensure_ascii=False)

    def to_dict(self, with_content: bool = False) -> dict:
        data = {
            "id": self.id,
            "title": self.title,
            "summary": self.summary,
            "category": self.category,
            "tags": self.tag_list,
            "cover": self.cover,
            "views": self.views,
            "published": self.published,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
        if with_content:
            data["content"] = self.content
        return data
