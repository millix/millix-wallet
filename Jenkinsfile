pipeline {
    agent none
    stages {
        stage('build on mac'){
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
        stage('build on win'){
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
        stage('build on linux'){
            agent {
                label 'linux'
            }
            steps {
                echo 'hello from linux'
                script{
                    sh('git submodule init')
                    sh('git submodule update')
                    sh('npm install')
                    sh('npm install -g grunt')
                    sh('grunt build-linux')
                }
            }
        }
    }
}
