'use strict';

const DEV = true;
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        bundle: './js/diaryApp',
        styles: './css'
    },
    output: {
        path: __dirname + '/public',
        filename: '[name].js',
        library: '[name]'
    },

    watch: DEV,
    watchOptions: {
        aggregateTimeout: 100
    },

    devtool: DEV ? 'cheap-inline-module-source-map' : null,

    plugins: [
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin('styles.css')
    ],

    module: {
        loaders: [{
            test: /\.html$/,
            loader: 'ng-cache'
        }, {
            test: /\.js$/,
            loader: 'babel?presets[]=es2015'
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style', 'css!autoprefixer?browsers=last 2 version')
        }, {
            test: /\.(png|ttf)$/,
            loader: 'file?name=[path][name].[ext]'
        }]
    }
};