pipeline {
    agent none
    stages {
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
                    sh('npm install -g grunt')
                    sh('grunt build-mac')
                }
            }
        }
    }
}
