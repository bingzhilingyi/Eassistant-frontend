const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');


const PATHS = {
    src: path.join(__dirname, 'src/index.js'),
    webapp: path.join(__dirname, 'webapp/'),
};

module.exports = {
    entry: {
        app: PATHS.src, //入口
        //test: PATHS.test,
    },
    output: {
        path: PATHS.webapp,
        filename: 'js/[name]-[chunkhash].js',
    },
    module: {
        rules: [{
                test: /.vue$/,
                use: [{
                        loader: 'vue-loader',
                        options: {
                            loaders: {
                                // less: ExtractTextPlugin.extract({
                                //     use: ['css-loader?minimize', 'autoprefixer-loader', 'less-loader'],
                                //     fallback: 'vue-style-loader'
                                // }),
                                // css: ExtractTextPlugin.extract({
                                //     use: ['css-loader', 'autoprefixer-loader', 'less-loader'],
                                //     fallback: 'vue-style-loader'
                                // })
                            }
                        }
                    },
                    {
                        loader: 'iview-loader',
                        options: {
                            prefix: false
                        }
                    }
                ]
            },
            {
                test: /(\.jsx|\.js)$/,
                use: {
                    loader: "babel-loader"
                },
                exclude: path.resolve(__dirname, 'node_modules'), //不处理的js代码
                include: path.resolve(__dirname, 'src'), //处理的js代码
            },
            {
                test: /\.css$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader",
                    options: {
                        // modules: true, // 指定启用css modules
                        // localIdentName: '[name]__[local]--[hash:base64:5]' // 指定css的类名格式
                    }
                }, {
                    loader: "postcss-loader"
                }]
            },
            {
                test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
                use: [{
                    loader: "url-loader",
                    options: {
                        limit: '1024',
                        outputPath: 'fonts',
                        name: '[name]-[hash].[ext]'
                    }
                }]
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/template/index.html', //html模版
            inject: 'body', //设置为false时js不会自动加入生成的html里，设置为head或body，来设定js插入的位置
            title: 'qafront-end',
            minify: { //压缩html
                removeComments: true, //删除注释
            },
            chunks: ['app'] //设置html需要导入的js
        }),
        // new HtmlWebpackPlugin({
        //     filename: 'index-dev.html',
        //     template: 'src/template/index-dev.html', //html模版
        //     chunks: ['test'] //设置html需要导入的js
        // })
        // 3. 配置全局使用 jquery
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            jquery: "jquery",
            "window.jQuery": "jquery"
        })
    ],
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            // 2. 定义别名和插件位置
            'jquery': 'jquery'
        }
    }
}