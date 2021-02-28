const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const path = require('path');
const webpack = require('webpack');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: {
    dank: './src/index.ts'
  },
  devtool: isProd ? 'hidden-source-map' : 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(nodeEnv)
      },
      'typeof CANVAS_RENDERER': JSON.stringify(true),
      'typeof WEBGL_RENDERER': JSON.stringify(true),
      'typeof EXPERIMENTAL': JSON.stringify(false),
      'typeof PLUGIN_CAMERA3D': JSON.stringify(false),
      'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
      'typeof FEATURE_SOUND': JSON.stringify(true)
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/index.html')
    })
  ],
  devServer: {
    contentBase: `${__dirname}/src/`,
    publicPath: '/',
    host: 'localhost',
    port: 4200,
    compress: true,
    hot: true
  }
};
