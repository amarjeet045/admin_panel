var config = {
    module: {
        rules: [{
                test: /app\.scss$/,
                use: [{
                        loader: 'file-loader',
                        options: {
                            name: 'bundle.css',
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
                test: /forms\.scss$/,
                use: [{
                        loader: 'file-loader',
                        options: {
                            name: 'frame.css',
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
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/preset-env'],
                },
            }
        ]
    },
}

var appConfig = Object.assign({}, config, {
    name: "app",
    entry: ['./app.scss', './app.js'],
    output: {
        path: "/",
        filename: "bundle.js"
    }
})

var frameConfig = Object.assign({}, config, {
    name: "app",
    entry: ["./forms/forms.scss", "./forms/init.js"],
    output: {
        path: '/dist/forms/',
        filename: "frame.js"
    }
})

module.exports = [appConfig, frameConfig];