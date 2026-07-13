// =============================================================================
// cc-site 生产部署 Pipeline（仅 pull + up，不在 Jenkins 上构建镜像）
// =============================================================================
//
// 【职责划分】
//   本地开发机：构建、本地运行、推送到 Docker Hub（release.sh）
//   Jenkins：    在生产服务器拉取镜像并启动容器
//
// 【Jenkins 前置配置】
//   1. Agent 安装在生产机（或能 SSH 到生产机），已装 Docker + docker compose
//   2. Credentials → Secret file，ID = cc-site-env-prod（内容为 deploy/.env.prod）
//   3. 生产机数据目录已创建：/data/mysql8、/data/attachment/ccsite（路径与 env 一致）
//   4. 修改下方 agent label（默认 prod）
//
// 【触发方式】
//   手动 Build with Parameters，传入 IMAGE_TAG（与 Docker Hub 已推送版本一致）
// =============================================================================

pipeline {
    agent {
        label 'prod'   // 改成你生产 Jenkins Agent 的标签
    }

    parameters {
        string(
            name: 'IMAGE_TAG',
            defaultValue: '1.0.0',
            description: 'Docker Hub 镜像版本（须已 push，如 1.0.0）'
        )
        choice(
            name: 'DEPLOY_MODE',
            choices: ['split', 'bundle'],
            description: 'split=backend+web 分离式；bundle=app 一体式'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare env') {
            steps {
                withCredentials([
                    file(credentialsId: 'cc-site-env-prod', variable: 'ENV_PROD_FILE')
                ]) {
                    sh 'cp "$ENV_PROD_FILE" deploy/.env.prod'
                }
            }
        }

        stage('Pull images') {
            steps {
                dir('deploy') {
                    sh '''
                        export DEPLOY_MODE="${DEPLOY_MODE}"
                        export IMAGE_TAG="${IMAGE_TAG}"
                        ./scripts/up-prod.sh pull
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                dir('deploy') {
                    sh '''
                        export DEPLOY_MODE="${DEPLOY_MODE}"
                        export IMAGE_TAG="${IMAGE_TAG}"
                        ./scripts/up-prod.sh up -d
                    '''
                }
            }
        }

        stage('Health check') {
            steps {
                sh '''
                    WEB_PORT=$(grep -E '^WEB_PORT=' deploy/.env.prod | tail -1 | cut -d= -f2- | tr -d '[:space:]')
                    WEB_PORT=${WEB_PORT:-8080}
                    for i in $(seq 1 30); do
                        if curl -fsS "http://127.0.0.1:${WEB_PORT}/api/health" | grep -q ok; then
                            echo "Health check passed on port ${WEB_PORT}"
                            exit 0
                        fi
                        echo "Waiting for service... (${i}/30)"
                        sleep 5
                    done
                    echo "Health check failed"
                    exit 1
                '''
            }
        }
    }

    post {
        failure {
            dir('deploy') {
                sh './scripts/up-prod.sh ps || true'
                sh './scripts/up-prod.sh logs --tail=100 || true'
            }
        }
    }
}
