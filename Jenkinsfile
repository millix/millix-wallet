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
                            dir('${WORKSPACE}/build_tools/osx') {
                                withCredentials([
                                    sshUserPrivateKey(credentialsId: "jenkins", keyFileVariable: 'keyfile_jenkins'),
                                    string(credentialsId: "jenkins_host", variable: 'jenkins_host'),
                                    sshUserPrivateKey(credentialsId: "info", keyFileVariable: 'keyfile_info'),
                                    string(credentialsId: "info_host_10", variable: 'info_host_10'),
                                    string(credentialsId: "info_host_11", variable: 'info_host_11')
                                    string(credentialsId: "jenkins_keychain_pwd", variable: 'jenkins_keychain_pwd')
                                    string(credentialsId: "millix_codesign_developer_id_application", variable: 'millix_codesign_developer_id_application')
                                    string(credentialsId: "millix_codesign_developer_id_installer", variable: 'millix_codesign_developer_id_installer')
                                    string(credentialsId: "millix_developer_team_id", variable: 'millix_developer_team_id')
                                    string(credentialsId: "millix_developer_apple_id", variable: 'millix_developer_apple_id')
                                    string(credentialsId: "millix_developer_pwd", variable: 'millix_developer_pwd')
                                ]){
                                    sh('security -v unlock-keychain -p ${jenkins_keychain_pwd} ~/Library/Keychains/login.keychain-db')
                                    sh('rm -rf millix.app millix-unsigned.app millix.pkg')
                                    sh('cp -a ${WORKSPACE}/app/dist/millix/osx64/millix.app millix-unsigned.app')
                                    sh('chmod -R a+xr millix-unsigned.app')
                                    sh('python build_mas.py --pkg millix.pkg --config-file build.cfg --input millix-unsigned.app --output millix.app --application-identity ${millix_codesign_developer_id_application} --installer-identity ${millix_codesign_developer_id_installer} --team-id ${millix_developer_team_id} --verbose')
                                    sh('xcrun notarytool submit millix.pkg --apple-id ${millix_developer_apple_id} --password ${millix_developer_pwd} --team-id ${millix_developer_team_id} --wait')
                                    sh('xcrun stapler staple millix.pkg')
                                    sh('mv millix.pkg ${WORKSPACE}/app/dist/installer')
                                    sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/installer/millix.pkg info@${info_host_10}:${DEST}')
                                    sh('scp -i ${keyfile_info} -oProxyCommand="ssh -i ${keyfile_jenkins} -W %h:%p millix_jenkins_s@${jenkins_host}" ${WORKSPACE}/app/dist/installer/millix.pkg info@${info_host_11}:${DEST}')
                                }
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
                            if(!fileExists('./app/dist/millix/millix-win-x64-unsigned'))
                            {
                                bat """
                                cd ./app/dist/millix/
                                mkdir millix-win-x64-unsigned
                                """.stripIndent().trim()
                            }
                            bat 'mv ./app/dist/millix/millix-win-x64/millix.exe ./app/dist/millix/millix-win-x64-unsigned/millix.exe'
                            echo 'sign binary'
                            dir('./../../../CodeSignTool-v1.2.0-windows')
                            {
                                withCredentials([
                                    string(credentialsId: 'ssl_totp_millix', variable: 'ssl_totp'),
                                    string(credentialsId: 'ssl_credential_id_millix', variable: 'ssl_credential_id'),
                                    string(credentialsId: 'ssl_username_millix', variable: 'ssl_username'),
                                    string(credentialsId: 'ssl_password_millix', variable: 'ssl_password')
                                ]){
                                    echo "sign the tangled binary"
                                    bat """CodeSignTool.bat sign ^
                                        -credential_id=${ssl_credential_id} ^
                                        -username=${ssl_username} ^
                                        -password=${ssl_password} ^
                                        -totp_secret=\"${ssl_totp}\" ^
                                        -output_dir_path=${WORKSPACE}/app/dist/millix/millix-win-x64/ ^
                                        -input_file_path=${WORKSPACE}/app/dist/millix/millix-win-x64-unsigned/millix.exe
                                        """
                                }
                            }

                            bat'npx grunt shell:innosetup'
                            echo 'sign installer'
                            dir('./../../../CodeSignTool-v1.2.0-windows')
                            {
                                withCredentials([
                                    string(credentialsId: 'ssl_totp_millix', variable: 'ssl_totp'),
                                    string(credentialsId: 'ssl_credential_id_millix', variable: 'ssl_credential_id'),
                                    string(credentialsId: 'ssl_username_millix', variable: 'ssl_username'),
                                    string(credentialsId: 'ssl_password_millix', variable: 'ssl_password')
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
                            }

                            echo 'making archive'
                            bat"cd ${WORKSPACE}/app/dist/installer/ && 7z a -tzip millix-win-x64.zip Millix_Setup.exe"

                            withCredentials([
                                sshUserPrivateKey(credentialsId: "info", keyFileVariable: 'keyfile_info'),
                                string(credentialsId: "info_10_port", variable: 'info_10_port'),
                                string(credentialsId: "info_11_port", variable: 'info_11_port'),
                                string(credentialsId: "gateway_host", variable: 'gateway_host')
                            ]){
                                bat'"c:\\Program Files\\git\\usr\\bin\\scp.exe" -i %keyfile_info% -P %info_10_port% %WORKSPACE%/app/dist/installer/millix-win-x64.zip info@%gateway_host%:%DEST%/millix-win-x64.zip'
                                bat'"c:\\Program Files\\git\\usr\\bin\\scp.exe" -i %keyfile_info% -P %info_11_port% %WORKSPACE%/app/dist/installer/millix-win-x64.zip info@%gateway_host%:%DEST%/millix-win-x64.zip'
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
