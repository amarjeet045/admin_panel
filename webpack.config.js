const path = require("path")
module.exports = [{
    entry: {
       app:['./index.js','./app.scss'],
       signup:['./js/signup.js'],
    },
    output: {
        filename: '[name].bundle.js',
    },
    module: {
        rules: [{
                test: /\app.scss$/,
                use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[name].bundle.css',
                        },
                    },
                    {
                        loader: 'extract-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: ['./node_modules']
                        }
                    },

                ],

            },
            {
                test: /\.js$/,
                loader: 'babel-loader?cacheDirectory',
                exclude: /node_modules/,
                query: {
                    presets: ['@babel/preset-env'],
                },
            }
        ]
    },
}];