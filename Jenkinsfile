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
        stage('Hello win'){
            agent {
                label 'win'
            }
            steps {
                echo 'hello from win'
                script {
                    bat'git submodule init'
                    bat'git submodule update'
                    bat'npm install'
                    bat'npm install -g grunt'
                    bat'grunt build-win'
                }
            }
        }
    }
}
