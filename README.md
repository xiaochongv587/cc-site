# CC-Site · 程序员个人网站

一个基于 **React + Flask** 的全栈个人网站：展示作品、记录技术笔记（博客），并带有完整的管理后台。视觉风格为简洁现代的浅色渐变 + 玻璃质感卡片，支持中英文切换、暗色模式、主题色动态配置。

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 18 · Vite 6 · TailwindCSS 3 · Framer Motion · React Router 6 · lucide-react · @uiw/react-md-editor |
| 后端 | Python 3.12+ · Flask 3 · SQLAlchemy · Flask-JWT-Extended · Flask-CORS |
| 数据库 | SQLite（开发）/ MySQL 8（生产） |
| 部署 | Docker Compose · Nginx（静态托管 + API 反代）· Gunicorn |

---

## 功能一览

**用户端**
- 首页：Hero（粒子背景 / 打字机 / 社交链接）、统计卡片、能力介绍、技能进度条、最新文章、精选项目、CTA
- 博客：列表 + 分类/标签筛选 + 搜索 + 分页；文章详情（Markdown 渲染 + 代码高亮 + 阅读量）
- 项目页：卡片展示、技术标签、精选标记、Star 数、GitHub/演示链接
- 中英文切换、暗色模式、返回顶部

**管理端（`/admin`）**
- JWT 登录，401 自动跳转，PrivateRoute 保护
- 仪表盘：文章/项目/技能/阅读量统计
- 文章管理：Markdown 编辑器、发布开关、标签、封面上传
- 项目管理：CRUD、精选开关、排序、技术栈、链接
- 技能管理：CRUD、分类、熟练度滑块
- 个人信息：基本信息、社交链接、多语言内容、统计数据、头像上传
- 主题管理：预设主题 + 自定义色 + 实时预览，保存后全站动态生效

**增强**：i18n、暗色模式、图片上传、文章搜索、RSS（`/rss.xml`）、Sitemap（`/sitemap.xml`）、SEO meta。

---

## 快速开始（开发）

前置：**Node 22+**、**Python 3.12+**。

```bash
# 一键启动（自动装依赖、建 venv、起前后端）
./start.sh
```

或手动启动：

```bash
# 后端
cd backend
python3.12 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py            # http://localhost:7200

# 前端（另开终端）
cd frontend
npm install
npm run dev              # http://localhost:5173
```

访问：
- 前端：http://localhost:5173
- 后台：http://localhost:5173/admin/login
- 健康检查：http://localhost:7200/api/health

**默认管理员账号：`admin` / `admin123`**（可在 `backend/.env` 修改）。

> 开发环境默认使用 SQLite，数据库文件 `backend/cc_site.db` 首次启动自动创建并写入种子数据。

---

## Docker 部署（生产）

```bash
cp .env.example .env      # 修改其中的密钥与数据库密码
docker compose build
docker compose up -d
```

架构：`Nginx(web:80)` 托管前端静态资源并反代 `/api`、`/uploads`、`/rss.xml` 到 `backend:7200(gunicorn)`，数据存于 `MySQL 8`。

访问：http://localhost:8080 （端口由 `.env` 的 `WEB_PORT` 控制）。

**数据持久化**：
- `db_data` 卷 → MySQL 数据
- `uploads_data` 卷 → 上传的图片

---

## 主要 API

公开（`/api/public/*`）：`profile`、`theme`、`stats`、`skills`、`projects`、`articles`（分页/筛选/搜索）、`articles/:id`、`tags`、`categories`
认证：`POST /api/auth/login`、`GET /api/auth/me`
管理（`/api/admin/*`，需 JWT）：`dashboard`、`articles` CRUD、`projects` CRUD、`skills` CRUD、`profile`、`theme`、`upload`
订阅：`GET /rss.xml`、`GET /sitemap.xml`

---

## 目录结构

```
cc-site/
├── backend/            # Flask 后端
│   ├── app/
│   │   ├── api/        # auth / public / admin / feed 蓝图
│   │   ├── models/     # User / Article / Project / Skill / Profile / Theme
│   │   ├── config.py   extensions.py  seed.py  __init__.py
│   ├── run.py  wsgi.py  requirements.txt  Dockerfile
├── frontend/           # React + Vite 前端
│   ├── src/
│   │   ├── api/  context/  components/  pages/  admin/
│   ├── Dockerfile  nginx.conf  tailwind.config.js
├── docs/screenshots/   # 页面 UI 参考
├── docker-compose.yml  start.sh  README.md
```

---

## 上线前检查清单

- [ ] 已将 `.env` 中的 `SECRET_KEY`、`JWT_SECRET_KEY` 改为强随机值
- [ ] 已修改默认管理员密码 `ADMIN_PASSWORD`
- [ ] 已修改 MySQL 的 root / 业务用户密码
- [ ] `SITE_URL` 指向真实域名（影响 RSS / sitemap 链接）
- [ ] `.env` 未提交到仓库（`.gitignore` 已忽略）
- [ ] `docker compose build` 通过、容器健康
- [ ] 反向代理/域名启用 HTTPS
- [ ] 数据卷（`db_data` / `uploads_data`）已纳入备份策略
