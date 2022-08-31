module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-move');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-nw-builder');

    const nodeWebKitEnv = {
        npm_config_target           : '0.66.0',
        npm_config_arch             : 'x64',
        npm_config_target_arch      : 'x64',
        npm_config_runtime          : 'node-webkit',
        npm_config_build_from_source: 'true',
        npm_config_node_gyp         : './node_modules/nw-gyp/bin/nw-gyp.js'
    };
    grunt.initConfig({
        clean: {
            options            : {
                'force': true
            },
            installer          : ['./app/dist/installer'],
            unpacked_wallet_app: ['./app/dist/unpacked'],
            build              : ['./app/dist'],
            build_credits_osx  : ['./app/dist/millix/osx64/credits.html'],
            build_credits_win  : ['./app/dist/millix/win64/credits.html'],
            build_credits_linux: ['./app/dist/millix/linux64/credits.html'],
            modules_millix_node: ['./deps/millix-node/node_modules'],
            modules_wallet_ui  : ['./deps/millix-wallet-ui/node_modules'],
            modules_wallet_app : ['./app/node_modules']
        },
        shell: {
            make_dist_dirs          : {
                command: 'cd app && mkdir dist && cd dist && mkdir installer && mkdir unpacked'
            },
            deps_millix_node        : {
                command: 'cd deps/millix-node && npm install'
            },
            deps_millix_node_sqlite3: {
                command: 'cd deps/millix-node && npm rebuild sqlite3',
                options: {
                    execOptions: {
                        env: {
                            ...process.env,
                            ...nodeWebKitEnv
                        }
                    }
                }
            },
            deps_wallet_ui          : {
                command: 'cd deps/millix-wallet-ui && npm install'
            },
            deps_wallet_app         : {
                command: 'cd app && npm install'
            },
            rename_worker_import    : {
                command: 'cd app && npm run worker-import-replace'
            },
            build_millix_node_worker: {
                command: 'cd deps/millix-node && npx webpack --entry ./database/pool/worker.mjs --config webpack.prod.config.js'
            },
            build_millix_node       : {
                command: 'cd deps/millix-node && npx webpack --entry ../../app/index.js --config webpack.prod.config.js'
            },
            build_wallet_ui         : {
                command: 'cd deps/millix-wallet-ui && npm run build',
                options: {
                    execOptions: {
                        env: {
                            ...process.env,
                            CI: 'false'
                        }
                    }
                }
            },
            release_win_deps        : {
                command: 'cd app/dist/millix-win-x64 && cp locales/en* . && rm -rf locales/* && cp en* locales && rm -r node_modules/* package-lock.json && npm install sqlite3 k-bucket'
            },
            webpack                 : {
                command: 'cd app && npm install && webpack --config webpack.config.js'
            },
            innosetup               : {
                command: 'innosetup-compiler millix.iss --verbose'
            },
            nwjs_win                : {
                command: 'build --tasks win-x64 --mirror https://dl.nwjs.io/ app'
            },
            nwjs_mac                : {
                command: 'build --tasks mac-x64 --mirror https://dl.nwjs.io/ app'
            },
            nwjs_linux              : {
                command: 'build --tasks linux-x64 --mirror https://dl.nwjs.io/ app'
            }
        },
        move : {
            wallet_ui         : {
                src : './deps/millix-wallet-ui/build/*',
                dest: './app/dist/unpacked/'
            },
            millix_node_worker: {
                src : './deps/millix-node/index.dist.js',
                dest: './app/dist/unpacked/worker.dist.js'
            },
            millix_node       : {
                src : [
                    './deps/millix-node/index.dist.js',
                    './deps/millix-node/build'
                ],
                dest: './app/dist/unpacked/'
            }
        },
        copy : {
            wallet_app            : {
                files: [
                    {
                        src : './app/package-dist.json',
                        dest: './app/dist/unpacked/package.json'
                    },
                    {
                        src : './app/node-main.js',
                        dest: './app/dist/unpacked/node-main.js'
                    },
                    {
                        expand: true,
                        cwd   : './app',
                        src   : 'icon.*',
                        dest  : './app/dist/unpacked/'
                    },
                    {
                        expand: true,
                        cwd   : './deps/millix-node/scripts',
                        src   : '**',
                        dest  : './app/dist/unpacked/scripts/'
                    }
                ]
            },
            database_scripts_win  : {
                files: [
                    {
                        expand: true,
                        cwd   : './deps/millix-node/scripts',
                        src   : '**',
                        dest  : './app/dist/millix/win64/scripts/'
                    }
                ]
            },
            database_scripts_osx  : {
                files: [
                    {
                        expand: true,
                        cwd   : './deps/millix-node/scripts',
                        src   : '**',
                        dest  : './app/dist/millix/osx64/scripts/'
                    }
                ]
            },
            database_scripts_linux: {
                files: [
                    {
                        expand: true,
                        cwd   : './deps/millix-node/scripts',
                        src   : '**',
                        dest  : './app/dist/millix/linux64/scripts/'
                    }
                ]
            }
        },
        nwjs : {
            options: {
                icon            : './app/icon.png',
                macIcns         : './app/icon.icns',
                winIco          : './app/icon.ico',
                winVersionString: {
                    'CompanyName'    : 'millix foundation',
                    'FileDescription': 'millix',
                    'ProductName'    : 'millix',
                    'LegalCopyright' : 'Copyright 2022'
                },
                version         : '0.66.0',
                flavor          : 'sdk',
                buildDir        : './app/dist',
                files           : './app/dist/unpacked/**/**'
            },
            osx    : {
                options: {
                    platforms: ['osx64']
                }
            },
            win    : {
                options: {
                    platforms: ['win64']
                }
            },
            linux  : {
                options: {
                    platforms: ['linux64']
                }
            }
        }
    });

    grunt.registerTask('build-core', [
        'clean:installer',
        'clean:unpacked_wallet_app',
        'clean:build',
        'clean:modules_millix_node',
        'clean:modules_wallet_ui',
        'clean:modules_wallet_app',
        'shell:make_dist_dirs',
        'shell:deps_millix_node',
        'shell:deps_millix_node_sqlite3',
        'shell:deps_wallet_ui',
        'shell:deps_wallet_app',
        'shell:rename_worker_import',
        'shell:build_millix_node_worker',
        'move:millix_node_worker',
        'shell:build_millix_node',
        'move:millix_node',
        'shell:build_wallet_ui',
        'move:wallet_ui',
        'copy:wallet_app'
    ]);

    grunt.registerTask('build-osx', [
        'build-core',
        'nwjs:osx',
        'clean:build_credits_osx'
    ]);

    grunt.registerTask('build-win', [
        'build-core',
        'nwjs:win',
        'clean:build_credits_win',
        'copy:database_scripts_win'
    ]);

    grunt.registerTask('build-linux', [
        'build-core',
        'nwjs:linux',
        'clean:build_credits_osx',
        'copy:database_scripts_linux'
    ]);
};
