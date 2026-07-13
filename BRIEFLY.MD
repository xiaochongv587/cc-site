# 精简流程

## 本地（不用 Jenkins）

```bash
cd deploy
cp .env.example .env.local   # 首次
cp .env.example .env.prod    # 首次（用于 release 读版本号）

# 本地跑起来
./scripts/up-local.sh up -d --build

# 构建并推送到 Docker Hub（分离式）
docker login
DEPLOY_ENV_FILE=.env.prod ./scripts/release.sh --split
```

## 生产（Jenkins Pipeline，仅 pull + 部署）

1. Jenkins 配置 Secret file：`cc-site-env-prod` = `.env.prod` 内容
2. Pipeline Job 使用仓库根目录 `Jenkinsfile`
3. **Build with Parameters** → `IMAGE_TAG=1.0.0`（与上面 push 的版本一致）

Jenkins 会自动执行：`up-prod.sh pull` → `up-prod.sh up -d` → 健康检查
