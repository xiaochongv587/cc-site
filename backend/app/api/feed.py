"""RSS 订阅与站点地图。"""
from __future__ import annotations

from flask import Blueprint, Response, current_app

from app.models import Article

feed_bp = Blueprint("feed", __name__)


def _xml_escape(text: str) -> str:
    return (
        (text or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


@feed_bp.get("/rss.xml")
def rss():
    site_url = current_app.config["SITE_URL"].rstrip("/")
    articles = (
        Article.query.filter_by(published=True)
        .order_by(Article.created_at.desc())
        .limit(20)
        .all()
    )
    items = []
    for a in articles:
        link = f"{site_url}/blog/{a.id}"
        pub_date = a.created_at.strftime("%a, %d %b %Y %H:%M:%S +0000") if a.created_at else ""
        items.append(
            f"""    <item>
      <title>{_xml_escape(a.title)}</title>
      <link>{link}</link>
      <guid>{link}</guid>
      <pubDate>{pub_date}</pubDate>
      <description>{_xml_escape(a.summary)}</description>
    </item>"""
        )
    body = "\n".join(items)
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>个人网站 · 博客</title>
    <link>{site_url}</link>
    <description>技术笔记与工作记录</description>
{body}
  </channel>
</rss>"""
    return Response(xml, mimetype="application/rss+xml")


@feed_bp.get("/sitemap.xml")
def sitemap():
    site_url = current_app.config["SITE_URL"].rstrip("/")
    urls = [f"{site_url}/", f"{site_url}/blog", f"{site_url}/projects"]
    for a in Article.query.filter_by(published=True).all():
        urls.append(f"{site_url}/blog/{a.id}")
    loc_tags = "\n".join(f"  <url><loc>{u}</loc></url>" for u in urls)
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{loc_tags}
</urlset>"""
    return Response(xml, mimetype="application/xml")
