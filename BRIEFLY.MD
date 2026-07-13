# 精简流程

## 本地（开发 / 可选手动发布）

```bash
cd deploy
cp .env.example .env.local   # 首次
cp .env.example .env.prod    # 首次（手动 release 时读版本号）

# 本地跑起来
./scripts/up-local.sh up -d --build

# 可选：本地构建并推送到 Docker Hub（分离式）
docker login
DEPLOY_ENV_FILE=.env.prod ./scripts/release.sh --split
```

## 生产（Jenkins 单机构建 + 发布，推荐）

**前置（一次性）：**

1. Jenkins 容器挂载 `/var/run/docker.sock`，容器内安装 `docker` CLI
2. Jenkins Credentials：
   - Secret file `cc-site-env-prod` = 服务器上 `deploy/.env.prod` 内容
   - Username/Password `dockerhub-cred` = Docker Hub 用户名 + Access Token
3. Pipeline Job 使用仓库根目录 `Jenkinsfile`，Agent label 为 `cc-one`

**每次发布：**

1. 打 tag：`git tag v1.0.0 && git push origin v1.0.0`
2. Jenkins → **Build with Parameters**
   - `GIT_REF` = `v1.0.0`
   - `IMAGE_TAG` = `1.0.0`
   - `DEPLOY_MODE` = `split`
   - `SKIP_BUILD` = `false`

**Pipeline 自动执行：** `verify-docker` → `build.sh` → `push.sh` → `up-prod.sh pull` → `up-prod.sh up -d` → 健康检查

**回滚（仅部署已有镜像）：** `SKIP_BUILD=true`，`IMAGE_TAG` 填上一稳定版本

## 手动部署（不用 Jenkins）

```bash
cd deploy
cp .env.example .env.prod   # 首次并编辑
./scripts/up-prod.sh pull
./scripts/up-prod.sh up -d
```
