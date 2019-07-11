const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        '../lib/buring-point': './src/buring-point.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].min.js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, 'public/index.html'),
            title: 'BuringPoint测试',
            hash: true
        })
    ],
    devServer: {
        host: '0.0.0.0',
        port: 8000,
        inline: true
    }
};