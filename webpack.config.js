/* global process */
const webpack = require('webpack');

// fix for https://github.com/webpack/webpack/issues/2537
if (process.argv.indexOf('-p') !== -1) {
    process.env.NODE_ENV = 'production';
}

module.exports = {
    entry: './script/main.js',
    output: {
        path: __dirname +  '/lib',
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                loader: 'eslint-loader',
                exclude: /node_modules/,
                enforce: 'pre',
                options: {
                    fix: true,
                },
            },
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: true,
                    },
                },
            },
        ],
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
    ],
};
