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
                    sh('git submodule init')
                    sh('git submodule update')
                    sh('npm install')
                    sh('grunt build mac')
                    sh('ls -lah');
                    sh('pwd')
                }
            }
        }
    }
}
