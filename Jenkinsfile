pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "dannynaco/tasklist-frontend"
        DOCKER_TAG   = "${BUILD_NUMBER}"
        SONAR_URL    = "https://sonarqube.cicd.kits.ext.educentre.fr"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Tests') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit 'reports/junit.xml'
                }
            }
        }

        stage('Coverage') {
            steps {
                sh 'npm run test:coverage'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    sh """
                        sonar-scanner \
                          -Dsonar.host.url=${SONAR_URL} \
                          -Dsonar.token=${SONAR_TOKEN} \
                          -Dsonar.projectKey=tasklist-frontend \
                          -Dsonar.sources=src \
                          -Dsonar.exclusions=src/__tests__/**,src/main.tsx \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    """
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ."
            }
        }

        stage('Security Scan') {
            steps {
                sh """
                    trivy image \
                      --exit-code 0 \
                      --severity HIGH,CRITICAL \
                      --format table \
                      ${DOCKER_IMAGE}:${DOCKER_TAG}
                """
            }
        }

        stage('Generate SBOM') {
            steps {
                sh """
                    trivy image \
                      --format spdx-json \
                      --output sbom-spdx.json \
                      ${DOCKER_IMAGE}:${DOCKER_TAG}
                """
                archiveArtifacts artifacts: 'sbom-spdx.json'
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
        success {
            echo 'Pipeline frontend termine avec succes.'
        }
        failure {
            echo 'Pipeline frontend en echec.'
        }
    }
}
