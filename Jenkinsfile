pipeline {
    agent none

    stages {
        stage('Hello') {
            agent any
            steps {
                echo 'Hello World'
            }
        }

        stage('Hello mac'){
            agent {
                label 'macos'
            }
            steps {
                echo 'hello from mac'
                script {
                    sh("touch jenkinstest-$(date '+%Y-%m-%d %H:%M:%S').txt")
                    sh('ls -lah');
                    sh('pwd')
                }
            }
        }
    }
}
