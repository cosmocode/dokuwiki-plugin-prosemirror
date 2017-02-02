/* global process */
const webpack = require('webpack');

// fix for https://github.com/webpack/webpack/issues/2537
if (process.argv.indexOf('-p') !== -1) {
    process.env.NODE_ENV = 'production';
}

module.exports = {
    entry: './script/main.js',
    output: {
        filename: 'lib/bundle.js',
    },
    module: {
        rules: [
            {
                loader: 'eslint-loader',
                enforce: 'pre',
                options: {
                    fix: true,
                },
            },
            {
                loader: 'babel-loader',
            },
        ],
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
    ],
};
