pipeline {
    environment {
        DEST = "/home/website/wallet/release"
    }
    agent any
    stages {
        stage('build'){
            parallel{
//                 stage('build on mac'){
//                     when {
//                         anyOf {
//                             branch 'master'
//                         }
//                     }
//                     agent {
//                         label 'macos'
//                     }
//                     steps {
//                         echo 'hello from mac'
//                         script {
//                             sh('git submodule init')
//                             sh('git submodule update')
//                             sh('npm install')
//                             sh('npm install -g grunt')
//                             sh('grunt build-mac')
//                             sh('cd ${WORKSPACE}/app/dist/millix-mac-x64/ && rm -r $(ls -A | grep -v millix.app)')
//                             sh('cd ${WORKSPACE}/app/dist/ && zip -r millix-mac-x64.zip millix-mac-x64/')
//                             withCredentials([
//                                 sshUserPrivateKey(credentialsId: "jenkins", keyFileVariable: 'keyfile_jenkins'),
//                                 string(credentialsId: "jenkins_host", variable: 'jenkins_host'),
//                                 sshUserPrivateKey(credentialsId: "info", keyFileVariable: 'keyfile_info'),
//                                 string(credentialsId: "info_host_10", variable: 'info_host_10'),
//                                 string(credentialsId: "info_host_11", variable: 'info_host_11')
//                             ]){
//                                 sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix-mac-x64.zip info@${info_host_10}:${DEST}')
//                                 sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix-mac-x64.zip info@${info_host_11}:${DEST}')
//                             }
//                             deleteDir()
//                         }
//                     }
//                 }
                stage('build on win'){
                    when {
                        anyOf {
                            branch 'master'
                            branch 'issue/MILLIX-25'
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
                            echo 'pre-rename unsigned'
                            if(!fileExists('./app/dist/unsigned'))
                            {
                                bat """
                                cd ./app/dist/
                                mkdir unsigned
                                """.stripIndent().trim()
                            }
                            if(fileExists('./app/dist/millix-win-x64/millix.exe'))
                            {
                                bat 'mv ./app/dist/millix-win-x64/millix.exe ./app/dist/unsigned/millix.exe'
                            }

                            echo 'sign binary'
                            dir('./../../../CodeSignTool-v1.2.0-windows')
                            {
                                withCredentials([
                                    string(credentialsId: 'ssl_totp', variable: 'ssl_totp'),
                                    string(credentialsId: 'ssl_credential_id', variable: 'ssl_credential_id'),
                                    string(credentialsId: 'ssl_username', variable: 'ssl_username'),
                                    string(credentialsId: 'ssl_password', variable: 'ssl_password')
                                ]){
                                    echo "sign the tangled binary"
                                    bat """CodeSignTool.bat sign ^
                                        -credential_id=${ssl_credential_id} ^
                                        -username=${ssl_username} ^
                                        -password=${ssl_password} ^
                                        -totp_secret=\"${ssl_totp}\" ^
                                        -output_dir_path=${WORKSPACE}/app/dist/millix-win-x64/ ^
                                        -input_file_path=${WORKSPACE}/app/dist/unsigned/millix.exe
                                        """
                                }
                            }

                            if(fileExists("${WORKSPACE}/app/dist/unsigned"))
                            {
                                echo 'remove temp'
                                bat"rm -rf ${WORKSPACE}/app/dist/unsigned/"
                            }

                            if(fileExists("${WORKSPACE}/unsigned"))
                            {
                                echo 'remove old unsigned installer folder'
                                bat "rm -rf ${WORKSPACE}/unsigned"
                            }

                            if(!fileExists("${WORKSPACE}/unsigned"))
                            {
                                echo 'create unsigned installer folder'
                                bat "cd ${WORKSPACE} && mkdir unsigned"
                            }

                            echo 'create installer'
                            bat """
                            iscc millix.iss
                            """.stripIndent().trim()

                            echo 'sign installer'
                            dir('./../../../CodeSignTool-v1.2.0-windows')
                            {
                                withCredentials([
                                    string(credentialsId: 'ssl_totp', variable: 'ssl_totp'),
                                    string(credentialsId: 'ssl_credential_id', variable: 'ssl_credential_id'),
                                    string(credentialsId: 'ssl_username', variable: 'ssl_username'),
                                    string(credentialsId: 'ssl_password', variable: 'ssl_password')
                                ]){
                                    echo "sign the tangled binary"
                                    bat """CodeSignTool.bat sign ^
                                        -credential_id=${ssl_credential_id} ^
                                        -username=${ssl_username} ^
                                        -password=${ssl_password} ^
                                        -totp_secret=\"${ssl_totp}\" ^
                                        -output_dir_path=${WORKSPACE}/ ^
                                        -input_file_path=${WORKSPACE}/../../unsigned/Millix_setup.exe
                                        """
                                }
                            }

                            echo 'making archive'
                            bat'tar -c millix-win-x64.zip Millix_setup.exe'

//                             withCredentials([
//                                 sshUserPrivateKey(credentialsId: "jenkins", keyFileVariable: 'keyfile_jenkins'),
//                                 string(credentialsId: "jenkins_host", variable: 'jenkins_host'),
//                                 sshUserPrivateKey(credentialsId: "info", keyFileVariable: 'keyfile_info'),
//                                 string(credentialsId: "info_host_10", variable: 'info_host_10'),
//                                 string(credentialsId: "info_host_11", variable: 'info_host_11')
//                             ]){
//                                 sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix-win-x64.zip info@${info_host_10}:${DEST}')
//                                 sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix-win-x64.zip info@${info_host_11}:${DEST}')
//                             }
//                             deleteDir()
                        }
                    }
                }
//                 stage('build on linux'){
//                     when {
//                         anyOf {
//                             branch 'master'
//                         }
//                     }
//                     agent {
//                         label 'linux'
//                     }
//                     steps {
//                         echo 'hello from linux'
//                         script{
//                             sh('git submodule init')
//                             sh('git submodule update')
//                             sh('npm install')
//                             sh('npm install -g grunt')
//                             sh('grunt build-linux')
//                             sh('cd ${WORKSPACE}/app/dist/ && zip -r millix-linux-x64.zip millix-linux-x64/')
//                             withCredentials([
//                                 sshUserPrivateKey(credentialsId: "jenkins", keyFileVariable: 'keyfile_jenkins'),
//                                 string(credentialsId: "jenkins_host", variable: 'jenkins_host'),
//                                 sshUserPrivateKey(credentialsId: "info", keyFileVariable: 'keyfile_info'),
//                                 string(credentialsId: "info_host_10", variable: 'info_host_10'),
//                                 string(credentialsId: "info_host_11", variable: 'info_host_11')
//                             ]){
//                                 sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix-linux-x64.zip info@${info_host_10}:${DEST}')
//                                 sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix-linux-x64.zip info@${info_host_11}:${DEST}')
//                             }
//                             deleteDir()
//                         }
//                     }
//                 }
            }
        }
    }
}
