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
                            sh('git submodule update -f')
                            sh('npm install')
                            sh('npx grunt build-osx')
                            sh('cd ${WORKSPACE}/app/dist/millix && mv osx64 millix-mac-x64 && zip -r millix-mac-x64.zip millix-mac-x64/')
                            withCredentials([
                                sshUserPrivateKey(credentialsId: "jenkins", keyFileVariable: 'keyfile_jenkins'),
                                string(credentialsId: "jenkins_host", variable: 'jenkins_host'),
                                sshUserPrivateKey(credentialsId: "info", keyFileVariable: 'keyfile_info'),
                                string(credentialsId: "info_host_10", variable: 'info_host_10'),
                                string(credentialsId: "info_host_11", variable: 'info_host_11')
                            ]){
                                sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix/millix-mac-x64.zip info@${info_host_10}:${DEST}')
                                sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix/millix-mac-x64.zip info@${info_host_11}:${DEST}')
                            }
                            deleteDir()
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
                            bat'git submodule update -f'
                            bat'npm install'
                            bat'npx grunt build-win'
                            bat'mv ./app/dist/millix/win64 ./app/dist/millix/millix-win-x64'
                            /*echo 'pre-rename unsigned'
                            if(!fileExists('./app/dist/unsigned'))
                            {
                                bat """
                                cd ./app/dist/
                                mkdir unsigned
                                """.stripIndent().trim()
                            }
                            if(fileExists('./app/dist/millix/millix-win-x64/millix.exe'))
                            {
                                bat 'mv ./app/dist/millix/millix-win-x64/millix.exe ./app/dist/unsigned/millix.exe'
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
                                        -output_dir_path=${WORKSPACE}/app/dist/millix/millix-win-x64/ ^
                                        -input_file_path=${WORKSPACE}/app/dist/unsigned/millix.exe
                                        """
                                }
                            }

                            if(fileExists("${WORKSPACE}/app/dist/unsigned"))
                            {
                                echo 'remove temp'
                                bat"rm -rf ${WORKSPACE}/app/dist/unsigned/"
                            }*/

                            if(fileExists("${WORKSPACE}/app/dist/installer/unsigned"))
                            {
                                echo 'remove old unsigned installer folder'
                                bat "rm -rf ${WORKSPACE}/app/dist/installer/unsigned"
                            }

                            if(!fileExists("${WORKSPACE}/app/dist/installer/unsigned"))
                            {
                                echo 'create unsigned installer folder'
                                bat "cd ${WORKSPACE}/app/dist/installer && mkdir unsigned"
                            }

                            echo 'create installer'
                            bat """
                            iscc millix.iss
                            """.stripIndent().trim()

                            /*echo 'sign installer'
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
                                        -output_dir_path=${WORKSPACE}/app/dist/installer/ ^
                                        -input_file_path=${WORKSPACE}/app/dist/installer/unsigned/Millix_Setup.exe
                                        """
                                }
                            }*/

                            bat"cp ${WORKSPACE}/app/dist/installer/unsigned/Millix_Setup.exe ${WORKSPACE}/app/dist/installer/"

                            echo 'making archive'
                            bat"cd ${WORKSPACE}/app/dist/installer/ && 7z a -tzip millix-win-x64.zip Millix_Setup.exe"

                            withCredentials([
                                sshUserPrivateKey(credentialsId: "jenkins", keyFileVariable: 'keyfile_jenkins'),
                                string(credentialsId: "jenkins_host", variable: 'jenkins_host'),
                                sshUserPrivateKey(credentialsId: "info", keyFileVariable: 'keyfile_info'),
                                string(credentialsId: "info_host_10", variable: 'info_host_10'),
                                string(credentialsId: "info_host_11", variable: 'info_host_11')
                            ]){
                                sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/installer/millix-win-x64.zip info@${info_host_10}:${DEST}')
                                sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/installer/millix-win-x64.zip info@${info_host_11}:${DEST}')
                            }
                            deleteDir()
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
                            sh('git submodule update -f')
                            sh('npm install')
                            sh('npx grunt build-linux')
                            sh('cd ${WORKSPACE}/app/dist/millix/ && mv linux64 millix-linux-x64 && zip -r millix-linux-x64.zip millix-linux-x64/')
                            withCredentials([
                                sshUserPrivateKey(credentialsId: "jenkins", keyFileVariable: 'keyfile_jenkins'),
                                string(credentialsId: "jenkins_host", variable: 'jenkins_host'),
                                sshUserPrivateKey(credentialsId: "info", keyFileVariable: 'keyfile_info'),
                                string(credentialsId: "info_host_10", variable: 'info_host_10'),
                                string(credentialsId: "info_host_11", variable: 'info_host_11')
                            ]){
                                sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix/millix-linux-x64.zip info@${info_host_10}:${DEST}')
                                sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/millix/millix-linux-x64.zip info@${info_host_11}:${DEST}')
                            }
                            deleteDir()
                        }
                    }
                }
            }
        }
    }
}
