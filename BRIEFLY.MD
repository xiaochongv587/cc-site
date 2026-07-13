<!--
 * @Description: 
 * @Author:  
 * @Date: 2026-07-13 21:02:22
 * @LastEditTime: 2026-07-13 21:02:40
 * @LastEditors:  
-->
# 精简流程
cd deploy

# 本地跑起来
./scripts/up-local.sh up -d --build

# 构建并推送到 Docker Hub（分离式）
docker login
DEPLOY_ENV_FILE=.env.prod ./scripts/release.sh --split

# 生产服务器部署
./scripts/up-prod.sh pull && ./scripts/up-prod.sh up -d