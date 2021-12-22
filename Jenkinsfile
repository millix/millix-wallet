pipeline {
    environment {
        DEST = "/home/website/wallet/release"
    }
    agent any
    stages {
        stage('build'){
            parallel{
                stage('build on mac'){
                    when {
                        anyOf {
                            branch 'master'
                        }
                    }
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
                            sh('cd ${WORKSPACE}/app/dist/ && zip -r millix-mac-x64.zip millix-mac-x64/')
                            withCredentials([
                                sshUserPrivateKey(credentialsId: "jenkins", keyFileVariable: 'keyfile_jenkins'),
                                string(credentialsId: "jenkins_host", variable: 'jenkins_host'),
                                sshUserPrivateKey(credentialsId: "info", keyFileVariable: 'keyfile_info'),
                                string(credentialsId: "info_host_10", variable: 'info_host_10'),
                                string(credentialsId: "info_host_11", variable: 'info_host_11')
                            ]){
                                sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix-mac-x64.zip info@${info_host_10}:${DEST}')
                                sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix-mac-x64.zip info@${info_host_11}:${DEST}')
                            }
//                             deleteDir()
                        }
                    }
                }
                stage('build on win'){
                    when {
                        anyOf {
                            branch 'master'
                        }
                    }
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
                            bat'cd app/dist && tar -cf millix-win-x64.zip millix-win-x64'
                            withCredentials([
                                sshUserPrivateKey(credentialsId: "jenkins", keyFileVariable: 'keyfile_jenkins'),
                                string(credentialsId: "jenkins_host", variable: 'jenkins_host'),
                                sshUserPrivateKey(credentialsId: "info", keyFileVariable: 'keyfile_info'),
                                string(credentialsId: "info_host_10", variable: 'info_host_10'),
                                string(credentialsId: "info_host_11", variable: 'info_host_11')
                            ]){
                                sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix-win-x64.zip info@${info_host_10}:${DEST}')
                                sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix-win-x64.zip info@${info_host_11}:${DEST}')
                            }
//                             deleteDir()
                        }
                    }
                }
                stage('build on linux'){
                    when {
                        anyOf {
                            branch 'master'
                        }
                    }
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
                            sh('cd ${WORKSPACE}/app/dist/ && zip -r millix-linux-x64.zip millix-linux-x64/')
                            withCredentials([
                                sshUserPrivateKey(credentialsId: "jenkins", keyFileVariable: 'keyfile_jenkins'),
                                string(credentialsId: "jenkins_host", variable: 'jenkins_host'),
                                sshUserPrivateKey(credentialsId: "info", keyFileVariable: 'keyfile_info'),
                                string(credentialsId: "info_host_10", variable: 'info_host_10'),
                                string(credentialsId: "info_host_11", variable: 'info_host_11')
                            ]){
                                sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix-linux-x64.zip info@${info_host_10}:${DEST}')
                                sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix-linux-x64.zip info@${info_host_11}:${DEST}')
                            }
//                             deleteDir()
                        }
                    }
                }
            }
        }
    }
}
