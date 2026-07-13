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

## Docker 部署与镜像发布

所有容器相关文件统一在 **`deploy/`** 目录：

```
deploy/
├── docker-compose.yml              # 本地构建（分离式）
├── docker-compose.prod.yml         # 生产拉取（分离式）
├── docker-compose.bundle.yml       # 本地构建（一体式）
├── docker-compose.prod.bundle.yml  # 生产拉取（一体式）
├── .env.example              # 环境变量模板 → 复制为 .env.local 或 .env.prod
├── VERSION                     # 镜像版本号
├── images/                     # Dockerfile（backend / web / app）
├── nginx/                      # Nginx 配置
└── scripts/
    ├── up-local.sh             # 本地：--env-file .env.local
    ├── up-prod.sh              # 生产：--env-file .env.prod
    ├── deploy-mode.sh          # 分离式 / 一体式选择
    ├── build.sh / push.sh / release.sh / verify-docker.sh
```

### 部署方式

| 方式 | `DEPLOY_MODE` | 镜像 | Compose 文件 |
|------|---------------|------|--------------|
| **分离式** | `split`（默认） | `cc-site-backend` + `cc-site-web` | `docker-compose.yml` / `docker-compose.prod.yml` |
| **一体式** | `bundle` | `cc-site-app` | `docker-compose.bundle.yml` / `docker-compose.prod.bundle.yml` |

可在 `.env.local` / `.env.prod` 中设置 `DEPLOY_MODE`，或在命令行指定 `--split` / `--bundle`。

### 镜像清单（Docker Hub）

| 镜像 | 用途 |
|------|------|
| `${DOCKERHUB_USER}/cc-site-backend:${TAG}` | Flask API（Gunicorn） |
| `${DOCKERHUB_USER}/cc-site-web:${TAG}` | Nginx 静态 + API 反代 |
| `${DOCKERHUB_USER}/cc-site-app:${TAG}` | 一体式（Nginx + Gunicorn） |

默认版本见 `deploy/VERSION`（当前 `1.0.0`）。

### 1. 本地构建并运行

**分离式（默认）：**

```bash
cd deploy
cp .env.example .env.local       # DEPLOY_MODE=split，并按需改本地路径/端口
mkdir -p data/mysql data/uploads
./scripts/up-local.sh up -d --build
```

**一体式：**

```bash
cd deploy
cp .env.example .env.local
# 编辑 .env.local：DEPLOY_MODE=bundle
mkdir -p data/mysql data/uploads
DEPLOY_MODE=bundle ./scripts/up-local.sh up -d --build
```

### 2. 构建并推送到 Docker Hub

运行 `./scripts/build.sh`、`./scripts/push.sh` 或 `./scripts/release.sh` 时会**交互提示**选择部署方式；也可直接指定：

```bash
docker login

cd deploy
cp .env.example .env.local   # 本地构建可读此文件
cp .env.example .env.prod    # 推送/生产用

# 分离式：仅 backend + web
./scripts/build.sh --split
./scripts/push.sh --split

# 一体式：仅 app
./scripts/build.sh --bundle
./scripts/push.sh --bundle

# 一键构建 + 推送（会先询问或传 --split / --bundle）
./scripts/release.sh --split
```

非交互环境（CI / 脚本）请设置环境变量：`DEPLOY_MODE=split` 或 `DEPLOY_MODE=bundle`。

### 3. 生产部署（Jenkins 单机构建 + 发布）

**职责划分（单节点：Jenkins 与 cc-site 在同一台服务器）：**

| 环境 | 做什么 | 命令 / 入口 |
|------|--------|-------------|
| **本地** | 开发、本地运行；可选手动构建 push | `./scripts/up-local.sh`、`release.sh` |
| **Jenkins** | checkout → 构建 → push → pull → 启动 | 仓库根目录 `Jenkinsfile` |

**Jenkins 前置配置（一次性）：**

1. 新建 **Pipeline** Job，SCM 指向本仓库，脚本路径 `Jenkinsfile`
2. Jenkins 容器挂载宿主机 `/var/run/docker.sock`，容器内安装 `docker` CLI 与 `docker compose`
3. 验证：`./deploy/scripts/verify-docker.sh`（Pipeline 首阶段也会自动执行）
4. 添加 Credentials：
   - **Secret file**，ID = `cc-site-env-prod`（上传 `deploy/.env.prod` 内容，含数据库密码等运行机密）
   - **Username with password**，ID = `dockerhub-cred`（Docker Hub 用户名 + **Access Token**）
5. `Jenkinsfile` 中 `agent { label 'cc-one' }` 须与 Jenkins 节点 Labels 一致
6. 宿主机创建数据目录：`/data/mysql8`、`/data/attachment/ccsite`（与 `.env.prod` 一致）

**`.env.prod` 不在代码库时的处理：**

| 阶段 | 所需变量 | 来源 |
|------|----------|------|
| 构建 / 推送 | `DOCKERHUB_USER`、`IMAGE_TAG`、`DEPLOY_MODE` | Pipeline 参数 + `dockerhub-cred` |
| 部署 / 运行 | 完整 `.env.prod`（密钥、数据目录、端口等） | Jenkins Secret file `cc-site-env-prod` |

部署时 Pipeline 会 `export IMAGE_TAG`，覆盖 Secret 文件中可能过期的版本号。

**Jenkins 每次发布：**

1. 打 Git tag：`git tag v1.0.0 && git push origin v1.0.0`
2. **Build with Parameters**：
   - `GIT_REF` = `v1.0.0`（或 `main`、`refs/tags/v1.0.0`）
   - `IMAGE_TAG` = `1.0.0`（与 tag 对应，去掉 `v` 前缀）
   - `DEPLOY_MODE` = `split` 或 `bundle`
   - `SKIP_BUILD` = `false`（回滚已有镜像时设为 `true`）

**回滚：** `SKIP_BUILD=true`，`IMAGE_TAG` 填上一稳定版本，重新触发 Pipeline。

**本地手动发布（可选，不用 Jenkins 时）：**

```bash
cd deploy
docker login
DEPLOY_ENV_FILE=.env.prod ./scripts/release.sh --split
./scripts/up-prod.sh pull && ./scripts/up-prod.sh up -d
```

一体式部署：`.env.prod` 设 `DEPLOY_MODE=bundle`，或 Jenkins 参数选 `bundle`。

### 4. GitHub Actions 自动发布（Docker Hub）

在 GitHub 仓库 Settings → Secrets 配置：
- `DOCKERHUB_USERNAME` — Docker Hub 用户名
- `DOCKERHUB_TOKEN` — Docker Hub Access Token

推送版本 tag 后自动构建并发布（tag 触发时发布全部镜像）：

```bash
git tag v1.0.0
git push origin v1.0.0
```

在 Actions 页面手动触发 **Publish Docker Images** 时，可选择 `split` / `bundle` / `all` 部署方式。

发布后的镜像地址示例：
- `xiaochongv587/cc-site-backend:1.0.0`
- `xiaochongv587/cc-site-web:1.0.0`
- `xiaochongv587/cc-site-app:1.0.0`

### 架构说明

分离式：`Nginx(web:80)` 托管前端并反代 `/api`、`/uploads`、`/rss.xml` 到 `backend:7200`；数据存于 `MySQL 8`。

访问：http://localhost:8080 （端口由 `deploy/.env.local` 或 `.env.prod` 的 `WEB_PORT` 控制）。

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
│   ├── run.py  wsgi.py  requirements.txt
├── frontend/           # React + Vite 前端
│   ├── src/
│   │   ├── api/  context/  components/  pages/  admin/
│   ├── tailwind.config.js  vite.config.js
├── deploy/             # 容器部署（compose / Dockerfile / 脚本）
├── docs/screenshots/   # 页面 UI 参考
├── start.sh  README.md
```

---

## 上线前检查清单

- [ ] `deploy/.env.prod` 中 `SECRET_KEY`、`JWT_SECRET_KEY` 已改为强随机值
- [ ] 已修改生产管理员密码与 MySQL 密码（`.env.prod`）
- [ ] `deploy/.env.local` / `.env.prod` 未提交到仓库
- [ ] `DOCKERHUB_USER` / `IMAGE_TAG` 与 `deploy/.env.prod` 一致
- [ ] 反向代理/域名启用 HTTPS
- [ ] 数据卷（`db_data` / `uploads_data`）已纳入备份策略
