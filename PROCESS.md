# 开发进度追踪

> 最后更新：2026-07-13　当前状态：**全部阶段已完成，前后端联调通过**

## 当前阶段
已完成阶段 0–7 全部内容，并完成端到端验证。

## 已完成事项
- [x] 阶段 0：个人信息已写入种子数据（`backend/app/seed.py`）
- [x] 阶段 1：产品与 API 设计（见下方 API 清单 / 目录结构 / README）
- [x] 阶段 2：项目初始化（backend Flask 脚手架 + frontend Vite 脚手架 + `start.sh`）
- [x] 阶段 3：首页（Hero 粒子/打字机、统计、能力卡、技能进度、最新文章、精选项目、CTA）
- [x] 阶段 4：博客列表（搜索/分类/标签/分页）+ 文章详情（Markdown + 代码高亮）+ 项目页
- [x] 阶段 5：管理后台（登录、仪表盘、文章/项目/技能/个人信息/主题 CRUD）
- [x] 阶段 6：增强（中英文 i18n、暗色模式、图片上传、文章搜索、RSS、sitemap、SEO）
- [x] 阶段 7：部署（backend/frontend Dockerfile、Nginx、docker-compose、README、上线清单）

## 验证记录
- 后端：`/api/health`、公开接口、登录、管理端 CRUD 均通过。
- 前端：首页/博客/项目/文章详情/后台各页 Playwright 检查，控制台 0 报错。
- 后台 UI 创建→删除技能自清理测试通过（JWT 鉴权链路 OK）。
- 前端生产构建 `npm run build` 通过，已按路由拆分（后台与 MD 编辑器懒加载）。
- Docker：本机未安装 Docker，compose 配置已通过 YAML 校验；生产构建等价的 `vite build` 已验证。

## 环境说明
- Node 22.22.3（nvm）、Python 3.14.4（venv），均满足 AGENTS.md 要求。
- 开发端口：前端 5173（被占用时自动 5174）、后端 7200。

## 已知问题 / 说明
- 内容以「阶段 0 个人信息」为准（昵称 Connor 等）；截图仅作视觉风格参考，故数据与截图示例不同属预期。
- Docker 构建需在安装了 Docker 的机器上执行 `docker compose build && docker compose up -d`。

---

## 项目全局约束
- 身份：程序员个人网站
- 目的：展示作品 + 记录日常工作/技术笔记（博客）
- 风格：
  - 简洁现代、浅色背景、渐变强调色（靛蓝/紫色系）
  - 玻璃质感卡片、圆角、适度动画
  - Hero 区：头像、打字机标签、社交链接
  - 数据统计卡片、技能进度条、项目/文章卡片
- 代码规范：分层清晰、RESTful API、中文注释适度

---

## 项目特征

| 维度 | 参考项目特征 |
|------|-------------|
| 用户端 | 首页（Hero + 统计 + 技能 + 文章 + 项目）、博客列表（标签筛选）、文章详情、项目页 |
| 管理端 | 登录、仪表盘、文章/项目/技能/个人信息/主题管理 |
| 视觉 | 简洁现代、渐变紫/靛蓝、玻璃卡片、粒子背景、打字机效果、Framer Motion 动画 |
| 技术 | React + Vite + TailwindCSS + API + JWT + Markdown + 主题可配置 |

---


## 阶段 0：个人信息

### 个人信息
- 昵称：Connor
- 一句话介绍：全栈工程师，用代码把想法变成可用的产品
- 职业标签：全栈工程师, React 开发者, Python 开发者, 开源爱好者, 终身学习者
- 个人简介：
  我是一名全栈工程师，日常在前端与后端之间来回切换，既关心页面是否好用，也在意接口和架构是否稳。喜欢把工作中的实践和踩坑记录成文章，方便自己复盘，也希望能帮到遇到同类问题的人。业余时间会折腾 side project，把新学的技术真正用起来。

- GitHub：https://github.com/connor
- 邮箱：connor@example.com
- 其他社交：（LinkedIn / Twitter 待补充）

### 技能列表
| 名称 | 分类 | 熟练度 |
|------|------|--------|
| React | 前端 | 90% |
| TypeScript | 前端 | 85% |
| TailwindCSS | 前端 | 85% |
| Python | 后端 | 90% |
| Flask | 后端 | 85% |
| MySQL | 数据库 | 80% |
| Docker | 运维 | 75% |
| Git | 工具 | 90% |

### 代表项目（示例，可后续替换）
1. **个人网站**
   - 描述：基于 React + Flask 的个人站点，支持博客发布与作品展示
   - 技术栈：React, Flask, TailwindCSS
   - 链接：https://github.com/connor/personal-website
   - 精选：是

2. **任务管理工具**
   - 描述：轻量级团队协作看板，支持拖拽排序与标签筛选
   - 技术栈：React, Python, SQLite
   - 链接：https://github.com/connor/task-board
   - 精选：是

## 示例文章（可后续替换）
1. **《Flask + React 前后端分离实践》**
   - 摘要：记录个人网站从 0 到 1 的搭建过程，包括 JWT 鉴权与 Markdown 渲染
   - 标签：Flask, React, 全栈
   - 正文：（Markdown，后续在管理后台编写）

2. **《TailwindCSS 主题系统设计》**
   - 摘要：用 CSS 变量实现可动态切换的主题色方案
   - 标签：CSS, TailwindCSS, 前端
   - 正文：（Markdown，后续编写）

### 统计数据
- 咖啡杯数：1288
- 项目数：12
- 文章数：28
- Star 数：356


---

## 阶段 1：产品与 API 设计

请为我的个人网站做产品与 API 设计，不要写代码。

用户端：
- 首页：Hero、统计数据、特色介绍、技能进度、最新文章、精选项目、CTA
- 博客：列表 + 标签云筛选 + 分页
- 文章详情：Markdown 渲染、阅读量
- 项目页：卡片展示、技术标签、外链

管理端（/admin）：
- JWT 登录
- 仪表盘（文章/项目/技能数量概览）
- 文章 CRUD（Markdown 编辑器）
- 项目 CRUD
- 技能 CRUD
- 个人信息管理
- 主题色管理（CSS 变量动态切换）

请输出：
1. 站点地图与路由表（前端 + API）
2. 数据库 ER 图（User、Article、Project、Skill、Theme）
3. 完整 REST API 清单（/api/public/* 和 /api/admin/*）
4. 前后端目录结构
5. 8 个实现里程碑及验收标准

---

## 阶段 2：项目初始化

请在本目录初始化个人网站项目。

目录结构：
cc-site/
├── frontend/          # React + Vite
├── backend/           # Flask
├── docs/screenshots/  # 页面UI参考
├── docker-compose.yml
├── start.sh
└── README.md

前端要求：
- React + Vite + TailwindCSS
- 安装：react-router-dom、framer-motion、lucide-react、@uiw/react-md-editor
- 配置 Vite proxy：/api → http://localhost:7200
- 建立全局 CSS 变量主题系统（--theme-primary、--theme-gradient 等）
- 字体：Inter（正文）+ 可选 display 字体
- 创建 Navbar、Footer、基础 Layout
- 路由骨架：/、/blog、/blog/:id、/projects、/admin/*

后端要求：
- Flask + Flask-SQLAlchemy + Flask-JWT-Extended + Flask-CORS
- 模型：User、Article、Project、Skill
- 种子数据：默认 admin 账号、示例文章/项目/技能
- 公开 API：/api/public/profile、/stats、/articles、/projects、/skills
- 管理 API：/api/admin/*（JWT 保护）
- 认证：/api/auth/login

交付内容：
1. 可运行的前后端
2. start.sh 一键启动脚本
3. README 含访问地址和默认账号

先完成脚手架和 API 骨架，页面用占位内容即可。

---

## 阶段 3：首页实现

请实现首页，视觉对齐截图(01-04)风格。

首页模块（从上到下）：
1. Hero：粒子背景、渐变装饰圆、头像首字母、打字机职业标签、简介、CTA 按钮、社交图标
2. 统计卡片：咖啡/项目/文章/Star 四宫格
3. 特色介绍：4 张能力卡片（全栈、架构、写作、创新）
4. 技能区：按分类分组 + 进度条动画
5. 最新文章：3 篇卡片
6. 精选项目：2 张项目卡片
7. CTA 区：渐变背景 + 联系按钮

技术要求：
- 数据从 /api/public/* 获取，失败时 fallback mock 数据
- Framer Motion：scroll 动画、hover 效果，支持 prefers-reduced-motion
- 复用组件：ParticleBackground、TypewriterText、ArticleCard、ProjectCard
- 样式类：btn-primary、btn-secondary、card-glass、section-title、skill-bar

我的内容：
[参考 阶段0 个人信息]

只实现首页及相关组件，不要动管理后台。

---

## 阶段 4：博客与项目页

请实现博客和项目展示页面, 视觉对齐截图(05-06)风格。

### 博客列表页 /blog
- 页面标题 + 副标题
- 标签云筛选（调用 /api/public/tags）
- 文章卡片网格（分页）
- 点击跳转 /blog/:id

### 文章详情页 /blog/:id
- Markdown 渲染（代码高亮）
- 标题、日期、标签、阅读量
- 返回列表链接

### 项目页 /projects
- 项目卡片：封面/图标、名称、描述、技术标签、GitHub/演示链接
- 精选标记、Star 数展示
- 响应式网格布局

样式与首页保持一致，复用已有 card、tag、section-title 样式。

---

## 阶段 5：管理后台

请实现管理后台 /admin，视觉对齐截图(07-14)风格。

## 认证
- /admin/login：用户名密码登录，JWT 存 localStorage
- 401 自动跳转登录页
- PrivateRoute 保护

## 后台布局
- 侧边栏导航：仪表盘、文章、项目、技能、个人信息、主题
- 顶部栏：当前用户、退出

## 各管理页
1. 仪表盘：文章/项目/技能数量统计卡片
2. 文章管理：列表 + 新建/编辑/删除，Markdown 编辑器，发布开关，标签
3. 项目管理：列表 + CRUD，精选开关，排序，技术栈、链接
4. 技能管理：列表 + CRUD，分类、熟练度滑块
5. 个人信息：昵称、简介、社交链接、欢迎语、CTA 文案、统计数据
6. 主题管理：主色/辅色选择器，实时预览，保存后全站生效

后端补齐对应 /api/admin/* CRUD 接口。

管理端风格：简洁表格 + 表单，与用户端渐变风格区分但保持统一品牌色。

---

## 阶段 6：增强功能

请为个人网站添加以下增强功能：

中英文切换（i18n，profile 支持中英文字段）
暗色模式
图片上传（头像、文章封面、项目封面）
文章搜索
RSS 订阅
SEO（meta、sitemap、og:image）

改动尽量小，不重构已有代码。

---

## 阶段 7：部署

请配置 Docker 部署方案。

要求：
- docker-compose：Nginx（前端静态 + API 反代）+ Flask + MySQL
- 生产构建：frontend npm run build，Nginx 托管
- 环境变量：数据库连接、JWT_SECRET
- 数据持久化说明

请：
1. 检查 docker-compose build 是否通过
2. 给出部署步骤
3. 提供上线前检查清单

不要提交 .env 中的密钥。

---