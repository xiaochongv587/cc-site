"""个人信息模型（单行配置，支持中英文字段）。"""
from __future__ import annotations

import json

from app.extensions import db


class Profile(db.Model):
    __tablename__ = "profile"

    id = db.Column(db.Integer, primary_key=True)

    # 基本信息（单语言）
    nickname = db.Column(db.String(100), default="站长")
    location = db.Column(db.String(100), default="")
    website = db.Column(db.String(300), default="")
    email = db.Column(db.String(200), default="")
    avatar = db.Column(db.String(500), default="")

    # 社交链接
    github = db.Column(db.String(300), default="")
    twitter = db.Column(db.String(300), default="")
    linkedin = db.Column(db.String(300), default="")

    # 多语言内容：中文
    bio_zh = db.Column(db.Text, default="")
    roles_zh = db.Column(db.Text, default="[]")  # JSON list
    welcome_zh = db.Column(db.String(200), default="")
    cta_title_zh = db.Column(db.String(200), default="")
    cta_desc_zh = db.Column(db.String(500), default="")

    # 多语言内容：英文
    bio_en = db.Column(db.Text, default="")
    roles_en = db.Column(db.Text, default="[]")
    welcome_en = db.Column(db.String(200), default="")
    cta_title_en = db.Column(db.String(200), default="")
    cta_desc_en = db.Column(db.String(500), default="")

    # 统计数据
    stat_coffee = db.Column(db.Integer, default=0)
    stat_projects = db.Column(db.Integer, default=0)
    stat_articles = db.Column(db.Integer, default=0)
    stat_stars = db.Column(db.Integer, default=0)

    @staticmethod
    def _load_list(value: str) -> list[str]:
        try:
            return json.loads(value or "[]")
        except (ValueError, TypeError):
            return []

    def to_dict(self) -> dict:
        return {
            "nickname": self.nickname,
            "location": self.location,
            "website": self.website,
            "email": self.email,
            "avatar": self.avatar,
            "social": {
                "github": self.github,
                "twitter": self.twitter,
                "linkedin": self.linkedin,
            },
            "stats": {
                "coffee": self.stat_coffee,
                "projects": self.stat_projects,
                "articles": self.stat_articles,
                "stars": self.stat_stars,
            },
            "i18n": {
                "zh": {
                    "bio": self.bio_zh,
                    "roles": self._load_list(self.roles_zh),
                    "welcome": self.welcome_zh,
                    "ctaTitle": self.cta_title_zh,
                    "ctaDesc": self.cta_desc_zh,
                },
                "en": {
                    "bio": self.bio_en,
                    "roles": self._load_list(self.roles_en),
                    "welcome": self.welcome_en,
                    "ctaTitle": self.cta_title_en,
                    "ctaDesc": self.cta_desc_en,
                },
            },
        }
