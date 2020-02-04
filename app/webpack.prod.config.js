const path              = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyPlugin        = require('copy-webpack-plugin');

module.exports = {
    target   : 'node-webkit',
    mode     : 'production',
    entry    : './src/index.js',
    output   : {
        filename: 'index.js',
        path    : path.resolve(__dirname, '.')
    },
    externals: {
        sqlite3: 'commonjs sqlite3'
    },
    devtool  : 'source-map',
    watch    : false,
    module   : {
        rules: [
            {
                test   : /\.(js|jsx)$/,
                exclude: /node_modules/,
                use    : {
                    loader : 'babel-loader',
                    options: {
                        presets    : [
                            '@babel/preset-env',
                            '@babel/preset-react'
                        ],
                        plugins    : [
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-transform-named-capturing-groups-regex'
                        ],
                        sourceMaps : 'inline',
                        retainLines: true
                    }
                },
                resolve: {
                    extensions: [
                        '.js',
                        '.jsx'
                    ]
                }
            },
            {
                test: /\.html$/,
                use : [
                    {
                        loader: 'html-loader'
                    }
                ]
            },
            {
                test: /\.css$/,
                use : [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.s[ac]ss$/i,
                use : [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test  : /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader'
            }
        ]
    },
    plugins  : [
        new CopyPlugin([
            {
                from: '../deps/millix-node/scripts',
                to  : './scripts'
            }
        ]),
        new HtmlWebPackPlugin({
            template: './src/index.html',
            filename: './index.html'
        })
    ]
};
