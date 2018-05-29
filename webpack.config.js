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
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['env', { modules: false }],
                        'stage-2', // suppport for ES7 features like the spread operator
                    ],
                },
            },
        ],
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
    ],
};
