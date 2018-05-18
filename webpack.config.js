const path = require('path');

const PATHS = {
    src: path.join(__dirname, 'src', 'index.js')
};

module.exports = {
    entry: [PATHS.src],
    output: {
        filename: 'index.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.elm$/,
                exclude: [/elm-stuff/, /node_modules/],
                loader: 'elm-webpack-loader?verbose=true&warn=true'
            }
        ],
        noParse: /\.elm$/
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.elm']
    },
    optimization: {
        minimize: true
    }
}
