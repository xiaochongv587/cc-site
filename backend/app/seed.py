"""数据库初始化与种子数据。

首次运行时自动建表；当核心表为空时写入示例数据，
内容取自 PROCESS.md「阶段 0：个人信息」。
"""
from __future__ import annotations

import json
import logging

from flask import current_app

from app.extensions import db
from app.models import Article, Profile, Project, Skill, Theme, User

logger = logging.getLogger(__name__)


ARTICLE_1_CONTENT = """# Flask + React 前后端分离实践

记录个人网站从 0 到 1 的搭建过程。

## 技术选型

- 前端：React + Vite + TailwindCSS
- 后端：Flask + SQLAlchemy
- 鉴权：JWT

## JWT 鉴权

后端使用 `Flask-JWT-Extended` 签发与校验令牌：

```python
token = create_access_token(identity=str(user.id))
```

前端将 token 存入 `localStorage`，并在请求拦截器中带上 `Authorization` 头。

## Markdown 渲染

文章正文使用 Markdown 存储，前端通过 `react-markdown` 渲染并做代码高亮。

> 前后端分离让职责更清晰，也让部署更灵活。
"""

ARTICLE_2_CONTENT = """# TailwindCSS 主题系统设计

用 CSS 变量实现可动态切换的主题色方案。

## 核心思路

将主题色暴露为 CSS 变量，Tailwind 通过 `rgb(var(--theme-primary))` 消费：

```css
:root {
  --theme-primary: 59 130 246;
  --theme-secondary: 99 102 241;
}
```

## 动态切换

管理后台修改主色后，写入 `document.documentElement.style`，全站即时生效，无需刷新。

这样既保留了 Tailwind 的原子化能力，又获得了运行时可配置的灵活性。
"""


def init_database() -> None:
    """建表并按需写入种子数据（幂等）。"""
    db.create_all()
    _seed_admin()
    _seed_profile()
    _seed_theme()
    _seed_skills()
    _seed_projects()
    _seed_articles()
    db.session.commit()
    logger.info("数据库初始化完成")


def _seed_admin() -> None:
    if User.query.first() is not None:
        return
    admin = User(username=current_app.config["ADMIN_USERNAME"])
    admin.set_password(current_app.config["ADMIN_PASSWORD"])
    db.session.add(admin)
    logger.info("已创建默认管理员 username=%s", admin.username)


def _seed_profile() -> None:
    if Profile.query.first() is not None:
        return
    profile = Profile(
        nickname="Connor",
        location="中国",
        website="",
        email="connor@example.com",
        github="https://github.com/connor",
        twitter="",
        linkedin="",
        bio_zh=(
            "我是一名全栈工程师，日常在前端与后端之间来回切换，"
            "既关心页面是否好用，也在意接口和架构是否稳。"
            "喜欢把工作中的实践和踩坑记录成文章，方便自己复盘，"
            "也希望能帮到遇到同类问题的人。业余时间会折腾 side project，"
            "把新学的技术真正用起来。"
        ),
        roles_zh=json.dumps(
            ["全栈工程师", "React 开发者", "Python 开发者", "开源爱好者", "终身学习者"],
            ensure_ascii=False,
        ),
        welcome_zh="你好，我是",
        cta_title_zh="让我们一起合作",
        cta_desc_zh="有想法？想要合作？或者只是想打个招呼？随时联系我！",
        bio_en=(
            "I'm a full-stack engineer who moves between frontend and backend every day. "
            "I care about both usable pages and stable APIs. I like turning real-world "
            "practice into articles, and I enjoy building side projects in my spare time."
        ),
        roles_en=json.dumps(
            [
                "Full Stack Engineer",
                "React Developer",
                "Python Developer",
                "Open Source Lover",
                "Lifelong Learner",
            ],
            ensure_ascii=False,
        ),
        welcome_en="Hello, I'm",
        cta_title_en="Let's Collaborate",
        cta_desc_en="Have an idea? Want to collaborate? Or just want to say hi? Feel free to reach out!",
        stat_coffee=1288,
        stat_projects=12,
        stat_articles=28,
        stat_stars=356,
    )
    db.session.add(profile)
    logger.info("已写入个人信息种子数据")


def _seed_theme() -> None:
    if Theme.query.first() is not None:
        return
    db.session.add(Theme())
    logger.info("已写入默认主题")


def _seed_skills() -> None:
    if Skill.query.first() is not None:
        return
    skills = [
        ("React", "前端", 90),
        ("TypeScript", "前端", 85),
        ("TailwindCSS", "前端", 85),
        ("Python", "后端", 90),
        ("Flask", "后端", 85),
        ("MySQL", "数据库", 80),
        ("Docker", "运维", 75),
        ("Git", "工具", 90),
    ]
    for idx, (name, category, level) in enumerate(skills):
        db.session.add(
            Skill(name=name, category=category, level=level, sort_order=idx)
        )
    logger.info("已写入技能种子数据")


def _seed_projects() -> None:
    if Project.query.first() is not None:
        return
    projects = [
        {
            "name": "个人网站",
            "description": "基于 React + Flask 的个人站点，支持博客发布与作品展示",
            "tech": ["React", "Flask", "TailwindCSS"],
            "github": "https://github.com/connor/personal-website",
            "featured": True,
            "stars": 128,
        },
        {
            "name": "任务管理工具",
            "description": "轻量级团队协作看板，支持拖拽排序与标签筛选",
            "tech": ["React", "Python", "SQLite"],
            "github": "https://github.com/connor/task-board",
            "featured": True,
            "stars": 86,
        },
    ]
    for idx, p in enumerate(projects):
        project = Project(
            name=p["name"],
            description=p["description"],
            github_url=p["github"],
            featured=p["featured"],
            stars=p["stars"],
            sort_order=idx,
        )
        project.tech_list = p["tech"]
        db.session.add(project)
    logger.info("已写入项目种子数据")


def _seed_articles() -> None:
    if Article.query.first() is not None:
        return
    articles = [
        {
            "title": "Flask + React 前后端分离实践",
            "summary": "记录个人网站从 0 到 1 的搭建过程，包括 JWT 鉴权与 Markdown 渲染",
            "content": ARTICLE_1_CONTENT,
            "category": "技术",
            "tags": ["Flask", "React", "全栈"],
            "views": 161,
        },
        {
            "title": "TailwindCSS 主题系统设计",
            "summary": "用 CSS 变量实现可动态切换的主题色方案",
            "content": ARTICLE_2_CONTENT,
            "category": "前端",
            "tags": ["CSS", "TailwindCSS", "前端"],
            "views": 57,
        },
        {
            "title": "欢迎使用个人网站",
            "summary": "这是一个基于 React + Flask 构建的个人网站",
            "content": "# 欢迎\n\n这是一个基于 React + Flask 构建的个人网站，用于展示项目与记录技术笔记。",
            "category": "公告",
            "tags": ["公告", "网站"],
            "views": 32,
        },
    ]
    for a in articles:
        article = Article(
            title=a["title"],
            summary=a["summary"],
            content=a["content"],
            category=a["category"],
            views=a["views"],
            published=True,
        )
        article.tag_list = a["tags"]
        db.session.add(article)
    logger.info("已写入文章种子数据")
