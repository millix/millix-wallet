const path     = require('path');
module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-babel');

    grunt.initConfig({
        env  : {
            build: {
                npm_config_target           : '0.42.1',
                npm_config_arch             : 'x64',
                npm_config_target_arch      : 'x64',
                npm_config_runtime          : 'node-webkit',
                npm_config_build_from_source: 'true',
                npm_config_node_gyp         : './node_modules/nw-gyp/bin/nw-gyp.js'
            }
        },
        clean: {
            options  : {
                'force': true
            },
            db       : ['./app/data/millix.*'],
            libs     : ['./libs'],
            build    : ['./app/dist'],
            installer: ['./installer']
        },
        babel: {
            options: {
                sourceMap: true,
                presets  : ['@babel/preset-env']
            },
            dist   : {
                files: [
                    {
                        expand: true,
                        cwd   : 'deps/',
                        src   : ['**/*.js'],
                        dest  : 'app/node_modules/'
                    }
                ]
            }
        },
        shell: {
            deps            : {
                command: 'cd deps/millix-node && npm install'
            },
            release_win_deps: {
                command: 'cd app/dist/millix-win-x64 && cp locales/en* . && rm -rf locales/* && cp en* locales && rm -r node_modules/* package-lock.json && npm install sqlite3 k-bucket'
            },
            webpack         : {
                command: 'cd app && npm install && webpack --config webpack.prod.config.js'
            },
            innosetup       : {
                command: 'innosetup-compiler InnoSetup.iss --verbose'
            },
            nwjs_win        : {
                command: 'build --tasks win-x64 --mirror https://dl.nwjs.io/ app'
            },
            nwjs_mac        : {
                command: 'build --tasks mac-x64 --mirror https://dl.nwjs.io/ app'
            },
            nwjs_linux      : {
                command: 'build --tasks linux-x64 --mirror https://dl.nwjs.io/ app'
            }
        }
    });

    grunt.registerTask('build-core', [
        'shell:deps',
        'env:build',
        'clean',
        'shell:webpack'
    ]);
    grunt.registerTask('build-win', [
        'build-core',
        'shell:nwjs_win',
        'shell:release_win_deps'
    ]);
    grunt.registerTask('build-mac', [
        'build-core',
        'shell:nwjs_mac'
    ]);
    grunt.registerTask('build-linux', [
        'build-core',
        'shell:nwjs_linux'
    ]);
    grunt.registerTask('installer', [
        'build-core',
        'shell:innosetup'
    ]);
};
