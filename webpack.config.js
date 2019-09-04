var appConfig = Object.assign({},config,{
    name:"app",
    entry:['./app.scss', './app.js'],
    output:{
        path:"/",
        filename:"bundle.js"
    }
})

var frameConfig = Object.assign({},config,{
    name:"app",
    entry:"./forms/js/init.js",
    output:{
        path:"/forms/",
        filename:"frame.js"
    }
})

var config = {
    module: {
        rules: [{
            test: /\.scss$/,
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
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
                presets: ['@babel/preset-env'],
            },
        }]
    },
}

module.exports = [appConfig,frameConfig];