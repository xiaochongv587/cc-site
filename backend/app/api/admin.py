"""管理接口：JWT 保护，提供各资源 CRUD 与图片上传。"""
from __future__ import annotations

import logging
import os
import uuid

from flask import Blueprint, current_app, jsonify, request, url_for
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models import Article, Profile, Project, Skill, Theme

logger = logging.getLogger(__name__)
admin_bp = Blueprint("admin", __name__)


@admin_bp.before_request
@jwt_required()
def _protect():
    """统一对管理接口做 JWT 校验。"""
    return None


# ----------------------------- 仪表盘 -----------------------------
@admin_bp.get("/dashboard")
def dashboard():
    total_views = db.session.query(db.func.sum(Article.views)).scalar() or 0
    return jsonify(
        {
            "articles": Article.query.count(),
            "projects": Project.query.count(),
            "skills": Skill.query.count(),
            "views": int(total_views),
        }
    )


# ----------------------------- 文章 CRUD -----------------------------
@admin_bp.get("/articles")
def admin_list_articles():
    articles = Article.query.order_by(Article.created_at.desc()).all()
    return jsonify([a.to_dict() for a in articles])


@admin_bp.get("/articles/<int:article_id>")
def admin_get_article(article_id: int):
    article = Article.query.get_or_404(article_id)
    return jsonify(article.to_dict(with_content=True))


@admin_bp.post("/articles")
def admin_create_article():
    data = request.get_json(silent=True) or {}
    if not (data.get("title") or "").strip():
        return jsonify({"message": "标题不能为空"}), 400
    article = Article(
        title=data["title"].strip(),
        summary=data.get("summary", ""),
        content=data.get("content", ""),
        category=data.get("category", "技术"),
        cover=data.get("cover", ""),
        published=bool(data.get("published", True)),
    )
    article.tag_list = data.get("tags", [])
    db.session.add(article)
    db.session.commit()
    return jsonify(article.to_dict(with_content=True)), 201


@admin_bp.put("/articles/<int:article_id>")
def admin_update_article(article_id: int):
    article = Article.query.get_or_404(article_id)
    data = request.get_json(silent=True) or {}
    article.title = data.get("title", article.title)
    article.summary = data.get("summary", article.summary)
    article.content = data.get("content", article.content)
    article.category = data.get("category", article.category)
    article.cover = data.get("cover", article.cover)
    if "published" in data:
        article.published = bool(data["published"])
    if "tags" in data:
        article.tag_list = data.get("tags", [])
    db.session.commit()
    return jsonify(article.to_dict(with_content=True))


@admin_bp.delete("/articles/<int:article_id>")
def admin_delete_article(article_id: int):
    article = Article.query.get_or_404(article_id)
    db.session.delete(article)
    db.session.commit()
    return jsonify({"message": "已删除"})


# ----------------------------- 项目 CRUD -----------------------------
@admin_bp.get("/projects")
def admin_list_projects():
    projects = Project.query.order_by(
        Project.sort_order.asc(), Project.id.desc()
    ).all()
    return jsonify([p.to_dict() for p in projects])


@admin_bp.post("/projects")
def admin_create_project():
    data = request.get_json(silent=True) or {}
    if not (data.get("name") or "").strip():
        return jsonify({"message": "项目名称不能为空"}), 400
    project = Project(
        name=data["name"].strip(),
        description=data.get("description", ""),
        cover=data.get("cover", ""),
        github_url=data.get("githubUrl", ""),
        demo_url=data.get("demoUrl", ""),
        stars=int(data.get("stars", 0) or 0),
        featured=bool(data.get("featured", False)),
        sort_order=int(data.get("sortOrder", 0) or 0),
    )
    project.tech_list = data.get("techStack", [])
    db.session.add(project)
    db.session.commit()
    return jsonify(project.to_dict()), 201


@admin_bp.put("/projects/<int:project_id>")
def admin_update_project(project_id: int):
    project = Project.query.get_or_404(project_id)
    data = request.get_json(silent=True) or {}
    project.name = data.get("name", project.name)
    project.description = data.get("description", project.description)
    project.cover = data.get("cover", project.cover)
    project.github_url = data.get("githubUrl", project.github_url)
    project.demo_url = data.get("demoUrl", project.demo_url)
    if "stars" in data:
        project.stars = int(data.get("stars", 0) or 0)
    if "featured" in data:
        project.featured = bool(data["featured"])
    if "sortOrder" in data:
        project.sort_order = int(data.get("sortOrder", 0) or 0)
    if "techStack" in data:
        project.tech_list = data.get("techStack", [])
    db.session.commit()
    return jsonify(project.to_dict())


@admin_bp.delete("/projects/<int:project_id>")
def admin_delete_project(project_id: int):
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({"message": "已删除"})


# ----------------------------- 技能 CRUD -----------------------------
@admin_bp.get("/skills")
def admin_list_skills():
    skills = Skill.query.order_by(Skill.sort_order.asc(), Skill.id.asc()).all()
    return jsonify([s.to_dict() for s in skills])


@admin_bp.post("/skills")
def admin_create_skill():
    data = request.get_json(silent=True) or {}
    if not (data.get("name") or "").strip():
        return jsonify({"message": "技能名称不能为空"}), 400
    skill = Skill(
        name=data["name"].strip(),
        category=data.get("category", "前端"),
        level=int(data.get("level", 80) or 80),
        sort_order=int(data.get("sortOrder", 0) or 0),
    )
    db.session.add(skill)
    db.session.commit()
    return jsonify(skill.to_dict()), 201


@admin_bp.put("/skills/<int:skill_id>")
def admin_update_skill(skill_id: int):
    skill = Skill.query.get_or_404(skill_id)
    data = request.get_json(silent=True) or {}
    skill.name = data.get("name", skill.name)
    skill.category = data.get("category", skill.category)
    if "level" in data:
        skill.level = int(data.get("level", 80) or 80)
    if "sortOrder" in data:
        skill.sort_order = int(data.get("sortOrder", 0) or 0)
    db.session.commit()
    return jsonify(skill.to_dict())


@admin_bp.delete("/skills/<int:skill_id>")
def admin_delete_skill(skill_id: int):
    skill = Skill.query.get_or_404(skill_id)
    db.session.delete(skill)
    db.session.commit()
    return jsonify({"message": "已删除"})


# ----------------------------- 个人信息 -----------------------------
@admin_bp.get("/profile")
def admin_get_profile():
    profile = Profile.query.first() or Profile()
    return jsonify(profile.to_dict())


@admin_bp.put("/profile")
def admin_update_profile():
    import json as _json

    profile = Profile.query.first()
    if profile is None:
        profile = Profile()
        db.session.add(profile)

    data = request.get_json(silent=True) or {}
    profile.nickname = data.get("nickname", profile.nickname)
    profile.location = data.get("location", profile.location)
    profile.website = data.get("website", profile.website)
    profile.email = data.get("email", profile.email)
    profile.avatar = data.get("avatar", profile.avatar)

    social = data.get("social", {})
    profile.github = social.get("github", profile.github)
    profile.twitter = social.get("twitter", profile.twitter)
    profile.linkedin = social.get("linkedin", profile.linkedin)

    stats = data.get("stats", {})
    profile.stat_coffee = int(stats.get("coffee", profile.stat_coffee) or 0)
    profile.stat_projects = int(stats.get("projects", profile.stat_projects) or 0)
    profile.stat_articles = int(stats.get("articles", profile.stat_articles) or 0)
    profile.stat_stars = int(stats.get("stars", profile.stat_stars) or 0)

    i18n = data.get("i18n", {})
    zh = i18n.get("zh", {})
    en = i18n.get("en", {})
    if zh:
        profile.bio_zh = zh.get("bio", profile.bio_zh)
        profile.roles_zh = _json.dumps(zh.get("roles", []), ensure_ascii=False)
        profile.welcome_zh = zh.get("welcome", profile.welcome_zh)
        profile.cta_title_zh = zh.get("ctaTitle", profile.cta_title_zh)
        profile.cta_desc_zh = zh.get("ctaDesc", profile.cta_desc_zh)
    if en:
        profile.bio_en = en.get("bio", profile.bio_en)
        profile.roles_en = _json.dumps(en.get("roles", []), ensure_ascii=False)
        profile.welcome_en = en.get("welcome", profile.welcome_en)
        profile.cta_title_en = en.get("ctaTitle", profile.cta_title_en)
        profile.cta_desc_en = en.get("ctaDesc", profile.cta_desc_en)

    db.session.commit()
    return jsonify(profile.to_dict())


# ----------------------------- 主题 -----------------------------
@admin_bp.get("/theme")
def admin_get_theme():
    theme = Theme.query.first() or Theme()
    return jsonify(theme.to_dict())


@admin_bp.put("/theme")
def admin_update_theme():
    theme = Theme.query.first()
    if theme is None:
        theme = Theme()
        db.session.add(theme)
    data = request.get_json(silent=True) or {}
    theme.primary = data.get("primary", theme.primary)
    theme.secondary = data.get("secondary", theme.secondary)
    theme.accent = data.get("accent", theme.accent)
    theme.preset = data.get("preset", theme.preset)
    theme.bg_style = data.get("bgStyle", theme.bg_style)
    theme.radius = data.get("radius", theme.radius)
    db.session.commit()
    return jsonify(theme.to_dict())


# ----------------------------- 图片上传 -----------------------------
def _allowed_file(filename: str) -> bool:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in current_app.config["ALLOWED_IMAGE_EXTENSIONS"]


@admin_bp.post("/upload")
def upload_image():
    if "file" not in request.files:
        return jsonify({"message": "未接收到文件"}), 400
    file = request.files["file"]
    if not file.filename:
        return jsonify({"message": "文件名为空"}), 400
    if not _allowed_file(file.filename):
        return jsonify({"message": "不支持的文件类型"}), 400

    ext = file.filename.rsplit(".", 1)[-1].lower()
    safe_name = f"{uuid.uuid4().hex}.{ext}"
    safe_name = secure_filename(safe_name)
    save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], safe_name)
    file.save(save_path)

    url = url_for("uploaded_file", filename=safe_name, _external=False)
    logger.info("图片上传成功 file=%s", safe_name)
    return jsonify({"url": url, "filename": safe_name}), 201
