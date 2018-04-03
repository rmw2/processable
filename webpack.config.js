const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

module.exports = {
  entry: './src/app/App.jsx',
  output: {
    path: path.resolve('build/alpha'),
    filename: 'bundle-[hash].js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [ 'css-loader' ]
        }),
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['env', 'react']
        }
      },
      {
        test: /\.md$/,
        use: 'raw-loader'
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "docs/alpha"),
    port: 9000
  },
  plugins: [
    new CopyWebpackPlugin([
        { from: 'samples', to: 'samples'}
    ]),
    new HtmlWebpackPlugin({
      template: './src/app/index.html'
    }),
    new ExtractTextPlugin({
      filename: '[name]-[hash].css'
    }),
    new WebpackCleanupPlugin(),
  ]
}
