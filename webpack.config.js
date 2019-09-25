const path = require("path")
module.exports = [{
    entry: {
        'app/app': ['./app/app.js','./app/app.scss'],
        'app/signup':'./app/js/signup.js',
        'public/public':['./public/js/public.js','./public/public.scss'],
    },

    output: {
        filename: '[name].bundle.js',
       
    },
    module: {
        rules: [{
                test: /\app[//]app.scss$/,
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
                test: /\public[//]public.scss$/,
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