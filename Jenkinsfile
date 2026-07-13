// =============================================================================
// cc-site 单机构建 + 发布 Pipeline
// =============================================================================
//
// 【职责划分（单节点）】
//   Jenkins（Docker 容器，挂载宿主机 docker.sock）在同一台服务器上完成：
//     checkout → build.sh → push.sh → up-prod.sh pull → up-prod.sh up -d → 健康检查
//   本地开发机仍可用 release.sh 手动构建推送（可选）
//
// 【Jenkins 前置配置】
//   1. Jenkins 容器挂载 /var/run/docker.sock，容器内安装 docker CLI + docker compose
//   2. Credentials → Secret file，ID = cc-site-env-prod（内容为 deploy/.env.prod）
//   3. Credentials → Username with password，ID = tcr-cred
//      （腾讯云账号 ID + TCR 访问凭证，登录 ccr.ccs.tencentyun.com）
//   4. 生产机数据目录：/data/mysql8、/data/attachment/ccsite
//   5. agent label 须与 Jenkins 节点标签一致（当前 cc-one）
//
// 【触发方式】
//   Build with Parameters：
//     GIT_REF    = v1.0.0（或 main / refs/tags/v1.0.0）
//     IMAGE_TAG  = 1.0.0（与 Git tag 对应，去掉 v 前缀）
//     DEPLOY_MODE = split | bundle
//     SKIP_BUILD = false（回滚时设为 true，仅 pull + 部署已有镜像）
// =============================================================================

pipeline {
    agent {
        label 'cc-one'   // Jenkins Agent 节点名称
    }

    parameters {
        string(
            name: 'GIT_REF',
            defaultValue: 'main',
            description: 'Git tag 或 branch，如 v1.0.0、main、refs/tags/v1.0.0'
        )
        string(
            name: 'IMAGE_TAG',
            defaultValue: '1.0.0',
            description: '镜像版本（与 GIT_REF 对应，如 1.0.0）'
        )
        choice(
            name: 'DEPLOY_MODE',
            choices: ['split', 'bundle'],
            description: 'split=backend+web 分离式；bundle=app 一体式'
        )
        booleanParam(
            name: 'SKIP_BUILD',
            defaultValue: false,
            description: '跳过构建和推送，仅部署镜像仓库上已有的镜像（用于回滚）'
        )
    }

    environment {
        DEPLOY_MODE = "${params.DEPLOY_MODE}"
        IMAGE_TAG = "${params.IMAGE_TAG}"
        IMAGE_REGISTRY = 'ccr.ccs.tencentyun.com'
        IMAGE_NAMESPACE = 'ccsite'
    }

    stages {
        stage('Verify Docker') {
            steps {
                sh './deploy/scripts/verify-docker.sh'
            }
        }

        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "${params.GIT_REF}"]],
                    userRemoteConfigs: scm.userRemoteConfigs,
                    extensions: scm.extensions
                ])
            }
        }

        stage('Build & Push') {
            when {
                expression { !params.SKIP_BUILD }
            }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'tcr-cred',
                        usernameVariable: 'TCR_USER',
                        passwordVariable: 'TCR_TOKEN'
                    )
                ]) {
                    sh '''
                        echo "$TCR_TOKEN" | docker login ccr.ccs.tencentyun.com -u "$TCR_USER" --password-stdin

                        export DEPLOY_MODE="${DEPLOY_MODE}"
                        export IMAGE_TAG="${IMAGE_TAG}"
                        export IMAGE_REGISTRY="${IMAGE_REGISTRY}"
                        export IMAGE_NAMESPACE="${IMAGE_NAMESPACE}"

                        cd deploy
                        DEPLOY_ENV_FILE=/dev/null ./scripts/build.sh --${DEPLOY_MODE}
                        DEPLOY_ENV_FILE=/dev/null ./scripts/push.sh --${DEPLOY_MODE}
                    '''
                }
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

    // 这 Jenkins pipeline 阶段失败时，自动执行的操作：
    // 1. 进入 deploy 目录（dir('deploy')）。
    // 2. 执行 './scripts/up-prod.sh ps'，用于打印当前所有容器的运行状态（ps），即 docker compose ps，方便定位问题，后面加 || true 保证就算命令报错也不会影响流程。
    // 3. 执行 './scripts/up-prod.sh logs --tail=100'，打印最近 100 行部署相关日志，帮助排查失败原因，同样 || true 保证即使报错流水线也能走完。
    // 通俗讲，就是失败时自动拉取最新的“服务状态”和“关键日志”信息，便于问题排查和追踪。
    post {
        failure {
            dir('deploy') {
                sh './scripts/up-prod.sh ps || true'
                sh './scripts/up-prod.sh logs --tail=100 || true'
            }
        }
    }
}
