'use strict';

const DEV = true;
const webpack = require('webpack');

module.exports = {
    entry: './js/diaryApp.js',
    output: {
        filename: 'bundle.js',
        library: 'app'
    },

    watch: DEV,
    watchOptions: {
        aggregateTimeout: 100
    },

    devtool: DEV ? 'cheap-inline-module-source-map' : null,

    plugins: [
        new webpack.NoErrorsPlugin()
    ],

    module: {

        loaders: [, {
            test: /\.html$/,
            loader: 'ng-cache'
        }, {
            test: /\.js$/,
            loader: 'babel?presets[]=es2015'
        }]

    }
};