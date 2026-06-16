pipeline {
    agent any

    triggers {
        pollSCM('* * * * *')
    }

    environment {
        COMPOSE_FILE = 'docker-compose.prod.yml'
        COMPOSE_PROJECT_NAME = 'rocket'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                script {
                    sh 'docker compose -f $COMPOSE_FILE build backend'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh 'docker compose -f $COMPOSE_FILE up -d --force-recreate backend'
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    sleep 5
                    def health = sh(
                        script: 'curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health || echo "000"',
                        returnStdout: true
                    ).trim()
                    if (health != '200') {
                        error "Health check failed: HTTP ${health}. Expected 200."
                    }
                    echo "Health check passed: HTTP ${health}"
                }
            }
        }
    }

    post {
        failure {
            echo 'Deployment failed. Check Jenkins console output for details.'
            slackSend(
                color: '#FF0000',
                message: "Deploy FAILED: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                channel: '#deployments'
            )
        }
        success {
            echo 'Deployment completed successfully.'
        }
    }
}
