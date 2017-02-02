const common = {
    entry: './script/main.js',
    output: {
        filename: 'lib/bundle.js',
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                loader: 'babel-loader',
            },
        ],
    },
};

module.exports = function () {
    if (process.env.ENV === 'prod') {
        common.devtool = false;
    }
    return common;
};
