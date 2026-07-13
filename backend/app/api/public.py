"""公开接口：无需鉴权，供用户端展示。"""
from __future__ import annotations

from collections import Counter

from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from app.extensions import db
from app.models import Article, Profile, Project, Skill, Theme

public_bp = Blueprint("public", __name__)


def _get_or_empty_profile() -> Profile:
    profile = Profile.query.first()
    return profile or Profile()


@public_bp.get("/profile")
def get_profile():
    return jsonify(_get_or_empty_profile().to_dict())


@public_bp.get("/theme")
def get_theme():
    theme = Theme.query.first() or Theme()
    return jsonify(theme.to_dict())


@public_bp.get("/stats")
def get_stats():
    """站点统计：优先使用 profile 配置值，同时提供真实计数。"""
    profile = _get_or_empty_profile()
    article_count = Article.query.filter_by(published=True).count()
    project_count = Project.query.count()
    skill_count = Skill.query.count()
    return jsonify(
        {
            "coffee": profile.stat_coffee,
            "projects": profile.stat_projects or project_count,
            "articles": profile.stat_articles or article_count,
            "stars": profile.stat_stars,
            "realCounts": {
                "articles": article_count,
                "projects": project_count,
                "skills": skill_count,
            },
        }
    )


@public_bp.get("/skills")
def list_skills():
    skills = Skill.query.order_by(Skill.sort_order.asc(), Skill.id.asc()).all()
    return jsonify([s.to_dict() for s in skills])


@public_bp.get("/projects")
def list_projects():
    projects = Project.query.order_by(
        Project.featured.desc(), Project.sort_order.asc(), Project.id.desc()
    ).all()
    return jsonify([p.to_dict() for p in projects])


@public_bp.get("/articles")
def list_articles():
    """文章列表：支持分页、标签、分类与关键词搜索。"""
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("perPage", 9, type=int), 50)
    tag = request.args.get("tag", type=str)
    category = request.args.get("category", type=str)
    keyword = request.args.get("q", type=str)

    query = Article.query.filter_by(published=True)

    if category and category not in ("all", "全部"):
        query = query.filter(Article.category == category)
    if tag:
        # tags 以 JSON 文本存储，用 like 粗筛（标签名唯一性足够）
        query = query.filter(Article.tags.like(f'%"{tag}"%'))
    if keyword:
        like = f"%{keyword}%"
        query = query.filter(
            or_(
                Article.title.like(like),
                Article.summary.like(like),
                Article.content.like(like),
            )
        )

    pagination = query.order_by(Article.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify(
        {
            "items": [a.to_dict() for a in pagination.items],
            "total": pagination.total,
            "page": page,
            "perPage": per_page,
            "pages": pagination.pages,
        }
    )


@public_bp.get("/articles/<int:article_id>")
def get_article(article_id: int):
    article = Article.query.filter_by(id=article_id, published=True).first()
    if article is None:
        return jsonify({"message": "文章不存在"}), 404
    article.views = (article.views or 0) + 1
    db.session.commit()
    return jsonify(article.to_dict(with_content=True))


@public_bp.get("/tags")
def list_tags():
    """聚合所有已发布文章的标签及计数。"""
    counter: Counter = Counter()
    for article in Article.query.filter_by(published=True).all():
        counter.update(article.tag_list)
    tags = [{"name": name, "count": count} for name, count in counter.most_common()]
    return jsonify(tags)


@public_bp.get("/categories")
def list_categories():
    rows = (
        db.session.query(Article.category)
        .filter(Article.published.is_(True))
        .distinct()
        .all()
    )
    return jsonify([r[0] for r in rows if r[0]])
