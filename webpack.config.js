const webpack = require('webpack');

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
