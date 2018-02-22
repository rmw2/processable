const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/app/App.jsx',
  output: {
    path: path.resolve('docs/alpha'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['env', 'react']
        }
      },
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
  ]
}